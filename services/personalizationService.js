const PersonalizationRepository = require("../infrastructure/repositories/personalizationRepository");
const repository = new PersonalizationRepository();
const elasticsearch = require('elasticsearch');
const config = require("../config");

module.exports = class PersonalizationService{
    async executeTask(synchronizationTask){
        try {
            const hrstart = process.hrtime();
            let personalizations = await repository.find(synchronizationTask);
            const fisrtId = personalizations.length > 0 ? personalizations[0]._id : "";
            let logInfo = `Task Started: ${this.synchronizationTaskToString(synchronizationTask)}, rows: ${personalizations.length}, fisrtId: ${fisrtId}`;
            console.log(logInfo); 

            if(personalizations && personalizations.length){
                const bulkResponse = await this.bulkDocumentsToElastic(synchronizationTask, personalizations);
                if(bulkResponse.errors) {
                    console.log("bulk Errors:", JSON.stringify(bulkResponse, null, '\t'));
                }
            }
            const hrend = process.hrtime(hrstart);
            const execTime = `${(hrend[0] + hrend[1] / 1e9).toFixed(2)} seconds`;
            logInfo = `Task Finised: ${this.synchronizationTaskToString(synchronizationTask)}, rows: ${personalizations.length}, Execution Time: ${execTime}`;
            console.log(logInfo); 
        } catch (error) {
            console.log("ERROR:", error);
        }             
    }

    synchronizationTaskToString(synchronizationTask){
        if(!synchronizationTask)
            return "";
        return `country:${synchronizationTask.country}|campaign:${synchronizationTask.campaign}|personalizationType:${synchronizationTask.personalizationType}|page:${synchronizationTask.page}`;
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