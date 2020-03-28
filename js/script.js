covidApi("brief", getCovidTable, attrs = { "tableName": "covid-table-global" })
covidApi("timeseries?iso2=RU&onlyCountries=true", getCovidTable, attrs = { "tableName": "covid-table-ru", "lines": 5 })

function getCovidTable(data, attrs = {}) {
    let info = [];

    let html =
        `<tr>
            <th>Date</th>
            <th>Confirmed</th>
            <th>Deaths</th>
            <th>Recovered</th>
        </tr>`

    if (data.length == 1) {
        for (const date in data[0].timeseries) {
            if (data[0].timeseries.hasOwnProperty(date)) {
                let element = data[0].timeseries[date];
                element["date"] = date;
                info.push(element)
            }
        }
    }
    else {
        info.push(data)
    }

    let count = info.length - 1;
    info[count]["date"] = "Yesterday";

    if (attrs.hasOwnProperty("lines")) {
        count -= attrs.lines;
    }
    else {
        count = -1;
    }

    for (let i = info.length - 1; i > count; i--) {
        const element = info[i];

        html +=
            `<tr>
                <td>${element.date}</td>
                <td>${element.confirmed}</td>
                <td>${element.deaths}</td>
                <td>${element.recovered}</td>
            </tr>`;

        document.getElementById(attrs.tableName).innerHTML = html;
    }
}

async function covidApi(request, func, attrs = {}) {
    let url = `https://wuhan-coronavirus-api.laeyoung.endpoint.ainize.ai/jhu-edu/${request}`
    let response = await fetch(url);
    data = await response.json();

    func(data, attrs);
}
