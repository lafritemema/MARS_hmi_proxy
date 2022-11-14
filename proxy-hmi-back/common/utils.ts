
import {parse, YAMLParseError} from 'yaml';
import {readFile} from 'fs/promises';
import {Configuration} from './properties';
import {BaseException} from './exceptions';


/**
 * fonction to read configuration from json file
 * and return config object
 * @param {string} jsonFile : yaml file containing the configuration
 * @return {Configuration} configuration
 */
export async function getConfigFromJson<ConfigType extends
  Configuration>(jsonFile:string):Promise<ConfigType> {
  try {
    const jsonContent = await readFile(jsonFile);
    const configStr = jsonContent.toString('utf-8');
    const configObject = JSON.parse(configStr);
    return <ConfigType>configObject;
  } catch (error) {
    let type = null;
    let msg = null;
    if (error instanceof SyntaxError) {
      msg = `configuration file ${jsonFile} is not under json format
      ${error.message}`;
    } else {
      msg = `The configuration file ${jsonFile} not found.`;
    }
    throw new BaseException(['CONFIG'],
        msg);
  }
}
