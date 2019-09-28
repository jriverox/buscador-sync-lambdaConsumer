
require("dotenv").config();

const config = {
    port: 3000,
    batchSize: 30,
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
            database: "costaricadb"
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
    }
};

module.exports = config;