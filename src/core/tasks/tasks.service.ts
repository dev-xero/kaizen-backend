import { NextFunction, Request, Response } from "express";

/**
 * Queries the database for tasks owned by this user, returns an empty array if none.
 * 
 * @param req Request object.
 * @param res Response object.
 * @param next Express Next Function.
 */
export async function getPersonalTasks(req: Request, res: Response, next: NextFunction) {

}

/**
 * Attempts to create a new personal task for a user.
 * 
 * @param req Request object.
 * @param res Response object.
 * @param next Express Next Function.
 */
export async function createPersonalTask(req: Request, res: Response, next: NextFunction ) {

}