
        const {
            AuthorizationError,
            InvalidTokenError,
            ValidationError,
            ForbiddenError,
            NotFoundError,
          } = require("../utils/errors");
          let axios = require("axios");
          const { JsonWebTokenError } = require("jsonwebtoken");
          const getDurationInMilliseconds = (start) => {
            const NS_PER_SEC = 1e9
            const NS_TO_MS = 1e6
            const diff = process.hrtime(start)
          
            return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS
          }
          
          
          module.exports = async (error, req, res, next) => {
            // console.log(error);
            // console.log(">>>> req.duration")
            // console.log(req.duration_start)
            // const durationInMilliseconds = getDurationInMilliseconds (req.duration_start)
                // console.log(`>>> ${req.method} ${req.originalUrl} [FINISHED] ${durationInMilliseconds.toLocaleString()} ms`)
                // req.duration=`${durationInMilliseconds.toLocaleString()} ms`
            
                // console.log(req.duration)
            if (
              !(
                error instanceof AuthorizationError ||
                error instanceof InvalidTokenError ||
                error instanceof ValidationError ||
                error instanceof ForbiddenError ||
                error instanceof NotFoundError || 
                error instanceof JsonWebTokenError
              )
            ) {
              // let text =
              //   "<b>ERROR ON SERVER</b> : %0A<b>" +
              //   req.method +
              //   " " +
              //   req.url +
              //   "</b>%0A" +
              //   `${JSON.stringify(error.stack)}`.substring(0, 300) +
              //   " ...";
                let t = `${JSON.stringify(error.stack)}`.substring(0, 300)
                t= t.replaceAll("","")
                t= t.replaceAll("`","")
                t= t.replaceAll("*","")
                t= t.replaceAll("_","")
                t=t.replaceAll(">","}").replaceAll("<","{").replaceAll("#","$")
                
                req.errorMethod= req.method +
                " " +
                req.url 
               ;
                req.errorText="%0A"+t +
                " ...";
          
              
            }
            if (error.status < 500) {
              return res.status(error.status).json(error);
            } else {
              return next(error);
            }
          };
          