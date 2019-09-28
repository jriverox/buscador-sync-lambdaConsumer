const mongoClient = require("mongodb").MongoClient;
const config = require("../../config");
const collectionName = "OfertaPersonalizada";

module.exports = class PersonalizationRepository{
    async find(synchronizationTask){
        const configDbItem = config.mongodb[synchronizationTask.country];
        let client;
        try {
            client = await mongoClient.connect(configDbItem.connectionString, {useUnifiedTopology: true, useNewUrlParser: true});
            const db = client.db(configDbItem.database);

            const query = {
                "AnioCampanaVenta": synchronizationTask.campaign,
                "TipoPersonalizacion": synchronizationTask.personalizationType
            };

            const limitValue = parseInt(synchronizationTask.batchSize);
            const skipValue = limitValue * parseInt(synchronizationTask.page);

            return await db.collection(collectionName)
                .find(query)
                .limit(limitValue)
                .skip(skipValue)
                .toArray();
        } catch (error) {
            throw new Error(error);
        } finally{
            client.close();
        }                   
    }
}