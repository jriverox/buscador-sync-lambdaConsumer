const PersonalizationRepository = require("../infrastructure/repositories/personalizationRepository");
const repository = new PersonalizationRepository();
const elasticsearch = require('elasticsearch');
const config = require("../config");
const logManager = require("../infrastructure/logging/logManager.js");
const ElasticsearchConnection = require("../infrastructure/utils/elasticsearchConnection");
const MongodbConnection = require("../infrastructure/utils/mongodbConnection");

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
            
            let message = `Task Finished: ${this.synchronizationTaskToString(synchronizationTask)}, rows: ${personalizations.length}`;
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
                tipoPersonalizacion: item.TipoPersonalizacion,
                cuv: item.CUV,
                productoResumenId: `${item.AnioCampanaVenta}.${item.CUV}.${item.TipoPersonalizacion}`,
                codigoConsultora: item.CodConsultora,
                diaInicio: item.DiaInicio,
                revistaDigital: item.FlagRevista,
                disponible: true,
                materialGanancia: item.MaterialGanancia === 0 ? false : true,
            };                        
            // { "update" : {"_id" : "2", "_type" : "_doc", "_index" : "index1", "retry_on_conflict" : 3} }
            // { "doc" : {"field" : "value"}, "doc_as_upsert" : true }
            body.push(
                //{ index:  { _index: indexName, _type: config.elasticsearch.indexType, _id: id } },
                { update:  { _index: indexName, _type: config.elasticsearch.indexType, _id: id, retry_on_conflict: 3 } },
                { doc : doc, doc_as_upsert: true }
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
        return ElasticsearchConnection.getConnection(country);
    }

    getPersonalizationId(campaign, cuv, personalizationType, consultant, startDay){
        return `${campaign}.${cuv}.${personalizationType}.${consultant}.${startDay}`;
    }

    async createConnections(countries) {
        let es = await ElasticsearchConnection.createAllConnections(countries);
        let mdb = await MongodbConnection.createAllConnections(countries);

        if (es && mdb) {
            return true;
        } else {
            return false;
        }
    }
}