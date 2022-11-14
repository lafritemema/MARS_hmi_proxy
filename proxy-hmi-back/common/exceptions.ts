/* eslint-disable no-unused-vars */
import {ExceptionDescription} from './properties';

/**
 * class representin
 */
export class BaseException extends Error {
  private _originStack:string[]
  private _description:string

  /**
   * BaseException constructor
   * @param {string[]} originStack : list of string describing the error origin
   * @param {ExceptionType} type : error type
   * @param {string} description : description of the error
   */
  public constructor(originStack:string[],
      description:string) {
    super();
    this._originStack = originStack;
    this._description = description;
  }

  /**
   * fonction to add new element in exception stack
   * @param {string[]} newStack : element to add
   */
  public addInStack(newStack:string[]) {
    this._originStack = newStack.concat(this._originStack);
  }

  /**
   * fonction to return the error description
   * @return {ExceptionDescription}
   */
  public describe() {
    const description:ExceptionDescription = {
      origin: this._originStack.join('.'),
      description: this._description,
    };
    return description;
  }

  /**
   * getter to return a message
   */
  public get message() {
    return `[${this._originStack.join('.')}] : ${this._description}`;
  }
}
