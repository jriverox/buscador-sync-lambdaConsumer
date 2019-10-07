const PersonalizationRepository = require("../infrastructure/repositories/personalizationRepository");
const repository = new PersonalizationRepository();
const elasticsearch = require('elasticsearch');
const config = require("../config");
const logManager = require("../infrastructure/logging/logManager.js")

module.exports = class PersonalizationService{
    async executeTask(synchronizationTask){
        try {
            const hrstart = process.hrtime();
            let personalizations = await repository.find(synchronizationTask);

            if(personalizations && personalizations.length){
                const bulkResponse = await this.bulkDocumentsToElastic(synchronizationTask, personalizations);
                if(bulkResponse.errors) {
                    console.log("bulk Errors:", JSON.stringify(bulkResponse, null, '\t'));
                }
            }
            
            let message = `Task Finised: ${this.synchronizationTaskToString(synchronizationTask)}, rows: ${personalizations.length}`;
            this.logInfo(message, "executeTask", synchronizationTask, hrstart, personalizations.length);
        } catch (error) {
            this.logError(error, "createJob", synchronizationTask);
        }             
    }

    logInfo(message, method, synchronizationTask, hrstart, length){
        const hrend = process.hrtime(hrstart);
        const execTimeInMilis = hrend[0] + hrend[1] / 1e6;
        console.log(message);     
        logManager.logInfo("PersonalizationService", method, synchronizationTask, message, execTimeInMilis, synchronizationTask.country, length);        
    }

    logError(error, method, synchronizationTask){
        console.log(error); 
        logManager.logError("PersonalizationService", method, synchronizationTask.correlationId, error.message, synchronizationTask.country, error, "", "");        
    }

    synchronizationTaskToString(synchronizationTask){
        if(!synchronizationTask)
            return "";        
        return `${synchronizationTask.correlationId}/Page: ${synchronizationTask.page}`;
    }

    async bulkDocumentsToElastic(synchronizationTask, personalizations){
        let body = [];
        const elasticClient = this.getElasticClient(synchronizationTask.country);
        const indexName = `${config.elasticsearch.indexPrefix}_${synchronizationTask.country.toLowerCase()}_${synchronizationTask.campaign}`;
        
        for (const item of personalizations) {
            let id = this.getPersonalizationId(item.AnioCampanaVenta, item.CUV, item.TipoPersonalizacion, item.CodConsultora, item.DiaInicio);
     
            let doc = {
                codigoCampania: item.AnioCampanaVenta,
                cuv: item.CUV,
                tipoPersonalizacion: item.TipoPersonalizacion,
                codigoConsultora: item.CodConsultora,
                diaInicio: item.DiaInicio,
                flagRevista: item.FlagRevista,
                materialGanancia: item.MaterialGanancia
            };                        

            body.push(
                { index:  { _index: indexName, _type: config.elasticsearch.indexType, _id: id } },
                doc
            ); 
        }

        const bulkResponse = await elasticClient.bulk({body});
        return bulkResponse;
    }

    getElasticClusterEndpoint(country){
        const cluster = config.elasticsearch.clusters.find(item => {
            return item.countries.some( x => {return x.toUpperCase() === country.toUpperCase();});
        });
        return cluster.endpoint;
    }

    getElasticClient(country){
        const endpoint = this.getElasticClusterEndpoint(country);
        return new elasticsearch.Client({
            host: endpoint
        });
    }

    getPersonalizationId(campaign, cuv, personalizationType, consultant, startDay){
        return `${campaign}.${cuv}.${personalizationType}.${consultant}.${startDay}`;
    }
}