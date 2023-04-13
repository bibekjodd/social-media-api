import { RequestHandler } from "express";

type CatchAsyncError = <Params, ResBody, ReqBody, ReqQuery>(
    passedFunction: RequestHandler<Params, ResBody, ReqBody, ReqQuery>
) => typeof passedFunction;

export const catchAsyncError: CatchAsyncError = (passedFunction) => {
    return (req, res, next) => {
        Promise.resolve(passedFunction(req, res, next)).catch(next);
    };
};
