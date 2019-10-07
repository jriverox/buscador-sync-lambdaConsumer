process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const request = require("sync-request");
const config = require("../../config");
const logEvent = require("./logEvent");

var logManager = function() {

    let getIndexName = function() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();

        if (dd < 10) {
            dd = "0" + dd
        }

        if (mm < 10) {
            mm = "0" + mm
        }

        return config.elasticLogging.pattern + yyyy + "." + mm + "." + dd;
    };

    let addLog = function (logEvent) {
        try {
            logEvent.Application = config.elasticLogging.application;
            if (config.elasticLogging.enabledInfo === true || config.elasticLogging.enabledError === true) {
                let url = `${config.elasticLogging.endpoint}/${getIndexName()}/${config.elasticLogging.type}`;
                const response = request("POST", url, { json: logEvent });
                console.log(response);
            }

        } catch (error) {
            console.error("Logging error: ", error);
        }
    };

    let logInfo = (
        className,
        method,
        parameters,
        message,
        elapsedTime,
        country,
        contentLength) => {

        let parametersString;
        if(typeof parameters === "object" && parameters !== null)
            parametersString = JSON.stringify(parameters);
        else
            parametersString = parameters;    

        let log = new logEvent(
            "INFO",
            className,
            method,
            parametersString,
            message,
            elapsedTime,
            country,
            "",
            contentLength,
            "",
            ""
        );

        addLog(log);
    }

    let logError = (
        className,
        method,
        parameters,
        message,
        pais,
        exception,
        remoteAddr,
        source = "") => {

            let parametersString;
            if(typeof parameters === "object" && parameters !== null)
                parametersString = JSON.stringify(parameters);
            else
                parametersString = parameters;
            
            let exceptionString;
            if(typeof exception === "object" && exception !== null)
                exceptionString = JSON.stringify(exception);
            else
                exceptionString = exception;
            
            let log = new logEvent(
                "ERROR",
                className,
                method,
                parametersString,
                message,
                0,
                pais,
                exceptionString,
                0,
                remoteAddr,
                source
            );

            addLog(log);
    };

    return {
        logInfo,
        logError
    };
}();

module.exports = logManager;