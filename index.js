
const PersonalizationService = require("./services/personalizationService");
const service = new PersonalizationService();
const logManager = require("./infrastructure/logging/logManager");

exports.handler = async (event, context) => {
    const hrstart = process.hrtime();
    let firstTask;
    for (const record of event.Records) {
      const { body } = record;      
      if(body){
        const synchronizationTask = JSON.parse(body);    
        await service.executeTask(synchronizationTask);
        if(!firstTask){
          firstTask = synchronizationTask;
        }
      }
      
      const hrend = process.hrtime(hrstart);
      const execTimeInMilis = hrend[0] + hrend[1] / 1e6;
      logManager.logInfo("index", "handler", firstTask, "Lambda terminado.", execTimeInMilis, firstTask.country, event.Records.length);

    }
    return {
      statusCode: 200,
      body: JSON.stringify("Ok")
  };
}