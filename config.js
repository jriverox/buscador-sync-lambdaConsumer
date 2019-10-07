
require("dotenv").config();

const config = {
    mongodb: {
        PE: {
            connectionString: process.env.MONGODB_PE,
            database: "BelcorpPeru"
        },
        CL: {
            connectionString: process.env.MONGODB_CL,
            database: "BelcorpChile"
        },        
        PA: {
            connectionString: process.env.MONGODB_PA,
            database: "BelcorpPanama"
        },
        CO: {
            connectionString: process.env.MONGODB_CO,
            database: "BelcorpColombia"
        },        
        CR: {
            connectionString: process.env.MONGODB_CR,
            database: "BelcorpCostaRica"
        }
    },
    elasticsearch:{
        clusters: [
            {
                endpoint: process.env.ELASTICSEARCH_C1,
                countries: ["PE","CL", "CR"]
            },
            {
                endpoint: process.env.ELASTICSEARCH_C2,
                countries: [ "CO", "PA" ]
            }
        ],
        indexPrefix: "producto_v8",
        indexType: "_doc"
    },
    elasticLogging: {
        endpoint: "https://search-qas-atd-f5uoi2tmrjd2i7rtdhfglnr7le.us-west-2.es.amazonaws.com",
        pattern: "dev-buscador-sync2-",
        type: "LogEvent",
        enabledInfo: true,
        enabledError: true,
        application: "LambdaConsumer"
    }
};

module.exports = config;