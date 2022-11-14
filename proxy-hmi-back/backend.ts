import express, {Request, Response} from 'express';
import {loadAsync} from 'node-yaml-config';
import {AMQPConfiguration, MessageBody, MessageQuery} from '@server/properties';
import {AMQPClient} from '@server/amqp';
import assert from 'node:assert';
import Logger from '@common/logger';
import {RequestMessage} from '@server/client';
import { request } from 'node:http';

let amqpClient:AMQPClient;
const CONFIG_DIR = process.cwd() + '/config';

const RESPONSE_TOPIC = 'response.hmi_proxy'
const REQUEST_TOPIC = 'request.enip_proxy';
const LOGGER = new Logger('HMI PROXY')

const HTTP_HOST = process.env.HOST;
const HTTP_PORT = parseInt(process.env.PORT);

loadAsync(CONFIG_DIR+'/server.yaml')
    .then((config:any)=>{
      // initAMQPClient(config.amqp)

      assert(HTTP_HOST && HTTP_PORT, "MISSING HOST AND PORT")

      const server = express();

      server.use(express.json());
      server.use('/', logRequest, sendAmqpRequest);

      server.listen(HTTP_PORT, HTTP_HOST, ()=>{
        LOGGER.info('Server ready to handle message');
      })
    }).catch((error)=>{
      LOGGER.error(error);
    })


function initAMQPClient(amqpConfig:AMQPConfiguration) {
  amqpClient = new AMQPClient('hmi-enip-proxy',
      amqpConfig.host,
      amqpConfig.port,
      amqpConfig.exchange);
  
  amqpClient.listen(RESPONSE_TOPIC);
  amqpClient.connect()
}

function logRequest(request:Request,
  response:Response,
  next:()=>void) {
    LOGGER.info('Message on path :'+ request.baseUrl + request.path);
    LOGGER.info('Body: '+JSON.stringify(request.body));
    LOGGER.info('Query : '+ request.query);
    next();
}

async function sendAmqpRequest(request:Request,
  response:Response,
  next:()=>void) {
  const query = <MessageQuery>{
    path:request.baseUrl + request.path,
    method: request.method.toUpperCase(),
    ... request.query
  }
  const body = <MessageBody> request.body

  console.log(query);

  const reqMessage = new RequestMessage(query, body)
      .setHeader('from', 'hmi-proxy');

  const responseMessage = await amqpClient.request(REQUEST_TOPIC, reqMessage, RESPONSE_TOPIC)

  response.send(responseMessage.body);

}