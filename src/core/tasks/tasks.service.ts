import http from "@constants/http";
import { NextFunction, Request, Response } from "express";

/**
 * Queries the database for tasks owned by this user, returns an empty array if none.
 * 
 * @param req Request object.
 * @param res Response object.
 * @param next Express Next Function.
 */
export async function getPersonalTasks(req: Request, res: Response, next: NextFunction) {
    const { username } = req.params;

    console.log("got username:", username);

    res.status(http.OK).json({
        status: 'success',
        message: 'Fetched user tasks.',
        data: {}
    })
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