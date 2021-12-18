import fp from 'lodash/fp';

export const stateCodes = [
    "AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "HI", "IA", "ID", "IL", "IN",
    "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV",
    "NY", "OH", "OK", "OR", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY",
]

export const stateNames = [
    "Alaska", "Alabama", "Arkansas", "Arizona", "California", "Colorado", "Connecticut", "District of Columbia",
    "Delaware", "Florida", "Georgia", "Hawaii", "Iowa", "Idaho", "Illinois", "Indiana", "Kansas", "Kentucky", "Louisiana",
    "Massachusetts", "Maryland", "Maine", "Michigan", "Minnesota", "Missouri", "Mississippi", "Montana", "North Carolina",
    "North Dakota", "Nebraska", "New Hampshire", "New Jersey", "New Mexico", "Nevada", "New York", "Ohio", "Oklahoma",
    "Oregon", "Pennsylvania", "Puerto Rico", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas",
    "Utah", "Virginia", "Vermont", "Washington", "Wisconsin", "West Virginia", "Wyoming"
]

export const statePopulations = [
    724357, 4934193, 3033946, 7520103, 39613493, 5893634, 3552821, 714153, 990334, 21944577, 10830007, 1406430,
    3167974, 1860123, 12569321, 6805663, 2917224, 4480713, 4627002, 6912239, 6065436, 1354522, 9992427, 5706398,
    6169038, 2966407, 1085004, 10701022, 770026, 1951996, 1372203, 8874520, 2105005, 3185786, 19299981, 11714618,
    3990443, 4289439, 12804123, 3194374, 1061509, 5277830, 896581, 6944260, 29730311, 3310774, 8603985, 623251,
    7796941, 5852490, 1767859, 581075
]

export interface VegaKV {
    key: number,
    value: number,
}

export interface Vega1DData {
    base: VegaKV[]
    table: VegaKV[]
}

export interface StateStats {
    stateCode: string,
    stateName: string,
    statePopulation: number,
    statePopulationRatio: number,
    sampleCount: number,
    expectedSampleCount: number,
    surplusDeficit: number,
}

const populationTotal = fp.sum(statePopulations);
const statePopulationRatios = statePopulations.map(pop => pop / populationTotal);

let tuneRatio: number = 100
let currentData: Vega1DData;


const computeStateCalc = () => {
    const stateCounts = currentData.table.map(d => [d.key, d.value]);
    stateCounts.sort((a, b) => a[0] - b[0]);

    const sampleCounts = stateCounts.map(d => d[1]);
    const sampleTotal = fp.sum(sampleCounts);

    console.log("tune ratio", (tuneRatio / 100))
    const scaledSampleTotal = sampleTotal * (tuneRatio / 100);
    const expectedSampleCounts = statePopulationRatios.map(popRatio => Math.round(popRatio * scaledSampleTotal))

    const surplusDeficits = sampleCounts.map((sample, idx) => sample - expectedSampleCounts[idx]);

    const surplusDeficitRatio = fp.zip(sampleCounts, expectedSampleCounts)
        .map(([sample, expected]) => Math.min(sample, expected) / scaledSampleTotal)

    const outData = stateCodes.map((stateCode, idx) => ({
        stateCode,
        stateName: stateNames[idx],
        statePopulation: statePopulations[idx],
        statePopulationRatio: statePopulationRatios[idx],
        sampleCount: sampleCounts[idx],
        expectedSampleCount: expectedSampleCounts[idx],
        surplusDeficit: surplusDeficits[idx]
    }))
    const deficits = outData.filter(d => d.surplusDeficit < 0)
    deficits.sort((a, b) => a.surplusDeficit - b.surplusDeficit)

    const surplus = outData.filter(d => d.surplusDeficit >= 0)
    surplus.sort((a, b) => b.surplusDeficit - a.surplusDeficit)


    const deficitRows = deficits.map(d => {
        return `<tr>
            <td>${d.stateName}</td>
            <td>${d.statePopulation}</td>
            <td>${d.statePopulationRatio}</td>
            <td>${d.sampleCount}</td>
            <td>${d.expectedSampleCount}</td>
            <td>${d.surplusDeficit}</td>
        </tr>
        `
    }).join('\n')

    const surplusRows = surplus.map(d => {
        return `<tr>
            <td>${d.stateName}</td>
            <td>${d.statePopulation}</td>
            <td>${d.statePopulationRatio}</td>
            <td>${d.sampleCount}</td>
            <td>${d.expectedSampleCount}</td>
            <td>${d.surplusDeficit}</td>
        </tr>
        `
    }).join('\n')

    const deficitTable = `<table class="table table-striped">
            <thead>
            <tr>
                <th scope="col">StateName</th>
                <th scope="col">Population</th>
                <th scope="col">Population (ratio)</th>
                <th scope="col">Sample Count</th>
                <th scope="col">Expected Count</th>
                <th scope="col">+/-</th>
            </tr>
            <tbody>
                ${deficitRows}
            </tbody>
        </thead>
    </table>`

    const surplusTable = `<table class="table table-striped">
        <thead>
        <tr>
            <th scope="col">StateName</th>
            <th scope="col">Population</th>
            <th scope="col">Population (ratio)</th>
            <th scope="col">Sample Count</th>
            <th scope="col">Expected Count</th>
            <th scope="col">+/-</th>
        </tr>
        <tbody>
            ${surplusRows}
        </tbody>
    </thead>
    </table>`
    const elm = document.getElementById('statedatatabledeficit');
    if (elm) {
        elm.innerHTML = deficitTable
    }

    const elm2 = document.getElementById('statedatatablesurplus');
    if (elm2) {
        elm2.innerHTML = surplusTable
    }

}

const updateToggle = () => {
    const elm = document.getElementById('toggleattr')
    if (elm) {
        elm.innerHTML = `<div>
        <h5>Pre Stratify Sample to US Population </h5>
        <p> <b>${tuneRatio}</b> [0 = no_user, 100 = all_users]</p>
        </div>
        `
    }

}

const elm = document.getElementById('statedatacontrols');
if (elm) {
    elm.innerHTML = '';

    const row = document.createElement('div')
    row.setAttribute('class', 'row')
    row.setAttribute('style', 'width: 1000px')

    const col6 = document.createElement('div')
    col6.setAttribute('class', 'col-6')

    const col6_2 = document.createElement('div')
    col6_2.setAttribute('class', 'col-6')
    col6_2.setAttribute('id', 'toggleattr')

    const tuneScore = document.createElement('input')
    tuneScore.setAttribute('type', 'range')
    tuneScore.setAttribute('class', 'form-range')
    tuneScore.setAttribute('min', '0')
    tuneScore.setAttribute('max', '100')
    tuneScore.setAttribute('value', `${tuneRatio}`)
    tuneScore.addEventListener('change', (e) => {
        console.log("I get called", e.target.value)
        if (e.target) {
            tuneRatio = e.target.value;
            computeStateCalc();
            updateToggle();
        }
    })

    col6.appendChild(tuneScore)
    row.appendChild(col6_2)
    row.appendChild(col6)
    elm.appendChild(row)

    updateToggle();
}


export const stateCalculation = (data: Vega1DData) => {
    currentData = data;
    computeStateCalc();
}

