setGlobalTable("covid-global-table");
setGlobalStatsTable("covid-global-stats");
setAllCountriesTable("covid-all-countries")
setCountryStatsTable("RU", "covid-ru-stats");
setCountryTable("RU", "covid-ru-table", 5);

async function setGlobalTable(tableId) {
    let url = "https://wuhan-coronavirus-api.laeyoung.endpoint.ainize.ai/jhu-edu/brief";
    let response = await fetch(url);
    data = await response.json();

    let html =
        `<tr>
            <th>Confirmed</th>
            <th>Deaths</th>
            <th>Recovered</th>
        </tr>
        <tr>
            <td>${data.confirmed}</td>
            <td>${data.deaths}</td>
            <td>${data.recovered}</td>
        </tr>`

    document.getElementById(tableId).innerHTML = html;
}

async function setGlobalStatsTable(tableId) {
    let url = `https://wuhan-coronavirus-api.laeyoung.endpoint.ainize.ai/jhu-edu/brief`
    let response = await fetch(url);
    data = await response.json();

    let html =
        `<tr>
            <th>Death</th>
            <th>Recovery</th>
        </tr>
        <tr>
            <td>${(data.deaths / (data.deaths + data.recovered) * 100).toFixed(2) + '%'}</td>
            <td>${(data.recovered / (data.deaths + data.recovered) * 100).toFixed(2) + '%'}</td>
        </tr>`

    document.getElementById(tableId).innerHTML = html;
}

async function setAllCountriesTable(tableId) {
    let url = `https://wuhan-coronavirus-api.laeyoung.endpoint.ainize.ai/jhu-edu/latest?onlyCountries=true`
    let response = await fetch(url);
    data = await response.json();

    let html =
        `<tr>
            <th>Country</th>
            <th>Confirmed</th>
            <th>Deaths</th>
            <th>Recovered</th>
        </tr>`

    data.forEach(element => {
        html +=
            `<tr>
                <td>${element.countryregion}</td>
                <td>${element.confirmed}</td>
                <td>${element.deaths}</td>
                <td>${element.recovered}</td>
            </tr>`
    });

    document.getElementById(tableId).innerHTML = html;
    addSorting(tableId);
}



async function setCountryTable(iso2, tableId, lines = 0) {
    let url = `https://wuhan-coronavirus-api.laeyoung.endpoint.ainize.ai/jhu-edu/timeseries?iso2=${iso2}&onlyCountries=true`
    let response = await fetch(url);
    data = await response.json();

    info = [];

    let html =
        `<tr>
            <th>Date</th>
            <th>Confirmed</th>
            <th>Deaths</th>
            <th>Recovered</th>
        </tr>`

    for (const date in data[0].timeseries) {
        if (data[0].timeseries.hasOwnProperty(date)) {
            let element = data[0].timeseries[date];
            element["date"] = convertDate(date);
            info.push(element)
        }
    }

    let count = info.length - 1;

    if (lines != 0) {
        count -= lines;
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

        document.getElementById(tableId).innerHTML = html;
    }
}

async function setCountryStatsTable(iso2, tableId) {
    let url = `https://wuhan-coronavirus-api.laeyoung.endpoint.ainize.ai/jhu-edu/timeseries?iso2=${iso2}&onlyCountries=true`
    let response = await fetch(url);
    data = await response.json();

    let keys = Object.keys(data[0].timeseries);
    data = data[0].timeseries[keys[keys.length - 1]];

    let html =
        `<tr>
            <th>Death</th>
            <th>Recovery</th>
        </tr>
        <tr>
            <td>${(data.deaths / (data.deaths + data.recovered) * 100).toFixed(2) + '%'}</td>
            <td>${(data.recovered / (data.deaths + data.recovered) * 100).toFixed(2) + '%'}</td>
        </tr>`

    document.getElementById(tableId).innerHTML = html;
}

function convertDate(date) {
    let temp = date.split("/");
    for (let i = 0; i < temp.length; i++) {
        if (temp[i].length == 1) {
            temp[i] = "0" + temp[i];
        }
    }
    return `${temp[1]}.${temp[0]}.${temp[2]}`
}

function addSorting(tableId) {
    const getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;

    const comparer = (idx, asc) => (a, b) => ((v1, v2) =>
        v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
    )(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));

    document.getElementById(tableId).querySelectorAll('th').forEach(th => th.addEventListener('click', (() => {
        const table = th.closest('table');
        Array.from(table.querySelectorAll('tr:nth-child(n+2)'))
            .sort(comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
            .forEach(tr => table.appendChild(tr));
    }), th.style.cursor = "pointer"));
}