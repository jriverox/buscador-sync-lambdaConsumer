//const mongoClient = require("mongodb").MongoClient;
//const config = require("../../config");
const collectionName = "OfertaPersonalizada";
const MongoConnection = require("../utils/mongodbConnection");

module.exports = class PersonalizationRepository {
    async find(synchronizationTask) {
        //const configDbItem = config.mongodb[synchronizationTask.country];
        let client;
        try {
            client = MongoConnection.getConnection(synchronizationTask.country);
            const collection = client.collection(collectionName);
            const query = {
                "AnioCampanaVenta": synchronizationTask.campaign,
                "TipoPersonalizacion": synchronizationTask.personalizationType
            };

            const limitValue = parseInt(synchronizationTask.batchSize);
            const skipValue = limitValue * parseInt(synchronizationTask.page);

            return await collection
                .find(query)
                .limit(limitValue)
                .skip(skipValue)
                .toArray();
        } catch (error) {
            throw new Error(error);
        } 
    }
}