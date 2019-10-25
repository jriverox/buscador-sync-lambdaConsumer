
require("dotenv").config();

const config = {
    enabledCountries: ["CL", "CO", "CR", "PE", "PA"],
    mongodb: {
        clusters: [
            {
                endpoint: process.env.MONGODB_C1,
                countries: {
                    CO: "BelcorpColombia",
                    BO: "BelcorpBolivia",
                    SV: "BelcorpSalvador",
                    PR: "BelcorpPuertoRico"
                }
            },
            {
                endpoint: process.env.MONGODB_C2,
                countries: {
                    PE: "BelcorpPeru",
                    CL: "BelcorpChile",
                    GT: "BelcorpGuatemala",
                    PA: "BelcorpPanama"
                }
            },
            {
                endpoint: process.env.MONGODB_C3,
                countries: {
                    MX: "BelcorpMexico",
                    EC: "BelcorpEcuador",
                    DO: "BelcorpDominicana",
                    CR: "BelcorpCostaRica_GANAMAS"
                }
            }
        ]
    },
    elasticsearch: {
        clusters: [
            {
                endpoint: process.env.ELASTICSEARCH_C1,
                countries: ["PE", "CL", "CR"]
            },
            {
                endpoint: process.env.ELASTICSEARCH_C2,
                countries: ["CO", "PA"]
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