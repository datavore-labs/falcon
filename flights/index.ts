import { App, ArrowDB, Logger, Views } from "../src";
import { stateCalculation, Vega1DData } from './stateCalc';

// document.getElementById("app")!.innerText = "";

type ViewName =
  | "user_count"
  | "user_count2"
  | "user_history"
  | "recency"
  | "frequency"
  | "monetary"
  | "avg_txn_per_month"
  | "avg_spend_per_month"
  | "user_history_frequency"
  | "user_history_recency"
  | "state_code";

type DimensionName =
  | "user_history"
  | "recency"
  | "frequency"
  | "monetary"
  | "avg_txn_per_month"
  | "avg_spend_per_month"
  | "state_code";

const views: Views<ViewName, DimensionName> = new Map();

views.set("user_count", {
  title: "User Count",
  type: "0D",
  el: document.getElementById("usercount")
});
views.set("user_count2", {
  title: "User Count",
  type: "0D",
  el: document.getElementById("usercount2")
});
views.set("user_history", {
  title: "user_history",
  type: "1D",
  el: document.getElementById("userhistory"),
  dimension: {
    name: "user_history",
    bins: 100,
    extent: [0, 750],
    format: 'd'
  },
  overrideConfig: {
    histogramWidth: 800,
  }
});
views.set("recency", {
  title: "recency",
  type: "1D",
  el: document.getElementById("recency"),
  dimension: {
    name: "recency",
    bins: 100,
    extent: [0, 750],
    format: "d"
  },
  overrideConfig: {
    histogramWidth: 800,
  }
});
views.set("frequency", {
  title: "frequency",
  type: "1D",
  el: document.getElementById("frequency"),
  dimension: {
    name: "frequency",
    bins: 50,
    extent: [0, 1000],
    format: "d"
  }
});
views.set("monetary", {
  title: "monetary",
  type: "1D",
  el: document.getElementById("monetary"),
  dimension: {
    name: "monetary",
    bins: 50,
    // extent: [0, 4000],
    format: ".1f"
  }
});
views.set("avg_txn_per_month", {
  title: "avg_txn_per_month",
  type: "1D",
  el: document.getElementById("avgtxnpermonth"),
  dimension: {
    name: "avg_txn_per_month",
    bins: 50,
    extent: [0, 100],
    format: ".1f"
  }
});

views.set("avg_spend_per_month", {
  title: "avg_spend_per_month",
  type: "1D",
  el: document.getElementById("avgspendpermonth"),
  dimension: {
    name: "avg_spend_per_month",
    bins: 50,
    extent: [0, 5000],
    format: ".1f"
  }
});

views.set("state_code", {
  title: "state_code",
  type: "1D",
  el: document.getElementById("statecode"),
  dimension: {
    name: "state_code",
    bins: 53,
    extent: [0, 53],
    format: ".1f"
  },
  onData: (data: Vega1DData) => {
    console.log("I got data from this chart", data)
    stateCalculation(data);
  },
  overrideConfig: {
    histogramWidth: 800,
  }
});


views.set("user_history_frequency", {
  title: "user_history_frequency",
  type: "2D",
  el: document.getElementById("userhistoryfrequency"),
  dimensions: [
    {
      title: "user_history",
      name: "user_history",
      bins: 100,
      extent: [0, 750],
      format: "d"
    },
    {
      title: "frequency",
      name: "frequency",
      bins: 100,
      extent: [0, 5000],
      format: "d"
    }
  ]
});

views.set("user_history_recency", {
  title: "user_history_recency",
  type: "2D",
  el: document.getElementById("userhistoryrecency"),
  dimensions: [
    {
      title: "user_history",
      name: "user_history",
      bins: 50,
      extent: [0, 750],
      format: "d"
    },
    {
      title: "recency",
      name: "recency",
      bins: 50,
      extent: [0, 750],
      format: "d"
    }
  ]
});

const url2 = require("../data/fetch_user_data.arrow");

// const url =
//   "https://media.githubusercontent.com/media/uwdata/flights-arrow/master/flights-10m.arrow";
const db = new ArrowDB<ViewName, DimensionName>(url2);

let logger: Logger<ViewName> | undefined;

//=============
// timeline vis logger

// logger = new TimelineLogger(createElement("logs"), views);

//=============
// simple logger as demo

// logger = new SimpleLogger<ViewName>();

const iPad = !!navigator.userAgent.match(/iPad/i);

new App(views, db, {
  config: {
    barWidth: 900,
    histogramWidth: 350,
    heatmapWidth: 275,
    toggleUnfiltered: false,
    ...(iPad
      ? {
        barWidth: 450,
        histogramWidth: 450,
        histogramHeight: 120,
        heatmapWidth: 300,
        prefetchOn: "mousedown"
      }
      : {})
  },
  logger: logger,
  cb: _app => {
    document.getElementById("loading")!.style.display = "none";

    //=============
    // benchmark

    // function animationframe() {
    //   return new Promise(resolve => requestAnimationFrame(resolve));
    // }

    // async function benchmark() {
    //   _app.prefetchView("AIR_TIME", false);

    //   console.time("Brushes");
    //   const step = 25;
    //   for (let start = 0; start < 500; start += step) {
    //     for (let end = start + step; end < 500 + step; end += step) {
    //       _app
    //         .getVegaView("AIR_TIME")
    //         .signal("brush", [start, end])
    //         .run();

    //       await animationframe();
    //     }
    //   }
    //   console.timeEnd("Brushes");
    // }

    // window.setTimeout(benchmark, 1000);
  }
});
