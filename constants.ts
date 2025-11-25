
export const reportStructure = [
    {
        title: "DOCAS",
        items: ["Entrada 01", "Entrada 02", "Entrada 03", "Entrada caminhão", "Saída caminhão", "Saída 01", "Clausura 01", "Saída 02", "Clausura 02"]
    },
    {
        title: "PRINCIPAL",
        items: ["Entrada 01", "Entrada 02", "Saída 01", "Saída 02", "Saída 03"]
    },
    {
        title: "PREFEITURA",
        items: ["Entrada 01", "Entrada 02", "Entrada 03"]
    },
    {
        title: "CALF",
        items: ["Entrada 01", "Entrada 02", "Saída 01", "Saída 02"]
    },
    {
        title: "TOTAL ATACADO",
        items: ["Entrada 01", "Entrada 02", "Saída 01", "Clausura 01", "Saída 02", "Clausura 02"]
    },
    {
        title: "ARMAZEM",
        items: ["Entrada 01", "Entrada 02"]
    },
    {
        title: "MOTO",
        items: ["Entrada 01", "Saída 01"]
    },
    {
        title: "MERCADÃO",
        items: ["Entrada 01", "Entrada 02", "Entrada Caminhão 01", "Saída Caminhão 01", "Saída Veículo 01"]
    },
    {
        title: "TERMINAIS",
        items: [
            "Epa Armazém 01", "Epa Armazém 02", "Epa Total Atacado", "Epa Petz",
            "Epa O Boticário", "Epa Hiper Ideal Dir", "Epa hiper ideal Esq", "Epa Academia",
            "Epa Smartfit Dir", "Epa Smartfit Esq", "Epa Americanas Dir", "Epa Americanas Esq",
            "Epa Caixa 24h Dir", "Epa Caixa 24h Esq", "Epa Pça Alím. Dir", "Epa Pça Alím. Esq"
        ]
    },
    {
        title: "TERMINAIS MERCADÃO",
        items: [
            "Epa Caixa Eletronico", "Epa Caixa Sub", "Epa Restaurante", "Epa Salão Veículos"
        ]
    }
];

export const allEquipment = reportStructure.flatMap(section => 
    section.items.map(item => `${section.title} - ${item}`)
);