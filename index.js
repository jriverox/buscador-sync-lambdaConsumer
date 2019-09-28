
const PersonalizationService = require("./services/personalizationService");
const service = new PersonalizationService();

exports.handler = async (event, context) => {
    for (const record of event.Records) {
      const { body } = record;      
      if(body){
        const synchronizationTask = JSON.parse(body);    
        await service.executeTask(synchronizationTask);
      }
    }
    return {
      statusCode: 200,
      body: JSON.stringify("Ok")
  };
}