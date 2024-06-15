import { Dexie } from "dexie";
import { IActivityResultsTable } from "./IActivityResultsTable";

// declare these on Dexie so TypeScript knows about them
declare module "dexie" {
  interface Dexie {
    activityResults: Dexie.Table<IActivityResultsTable, string>;
  }
}

const db = new Dexie("m2c2db");

db.version(1).stores({
  // keep the below in sync with code in index.ts
  activityResults: "document_uuid,timestamp,activity_publish_uuid",
});

db.activityResults.count().then((totalCount) => {
  db.activityResults.orderBy("activity_publish_uuid").uniqueKeys((keys) => {
    const activityCounts = keys.map((key) =>
      db.activityResults
        .where("activity_publish_uuid")
        .equals(key)
        .count()
        .then((count) => {
          return { key: key.toString(), count };
        }),
    );

    Promise.all(activityCounts).then((results) => {
      const p = document.createElement("p");
      p.innerHTML =
        "<b>m2c2db activityResults count: " + totalCount + "<b><br/>";
      document.body.appendChild(p);

      results.forEach((result) => {
        p.innerHTML = p.innerHTML + result.key + ": " + result.count + "<br/>";
      });

      const button = document.createElement("button");
      button.innerHTML = "delete data";
      button.onclick = () => {
        if (
          confirm("PERMANENTLY delete all activity data (activityResults)?")
        ) {
          db.activityResults
            .clear()
            .then(() => {
              console.log("activityResults deleted");
            })
            .catch((err) => {
              console.error("Could not delete activityResults. err: " + err);
            });
        }
      };
      document.body.appendChild(button);

      db.transaction("r", db.tables, () =>
        Promise.all(
          db.tables.map((table) =>
            table.toArray().then((rows) => ({ table: table.name, rows: rows })),
          ),
        ).then(([tableRows]) => {
          const blob = new Blob([JSON.stringify(tableRows)], {
            type: "application/json",
          });
          const p1 = document.createElement("p");
          const downloadLink = document.createElement("a");
          downloadLink.setAttribute(
            "download",
            `m2c2db-${new Date().toISOString()}.json`,
          );
          downloadLink.appendChild(document.createTextNode("download data"));
          downloadLink.href = `${URL.createObjectURL(blob)}`;
          p1.appendChild(downloadLink);
          document.body.appendChild(p1);

          const p2 = document.createElement("p");
          const viewLink = document.createElement("a");
          viewLink.appendChild(document.createTextNode("view data"));
          viewLink.href = `${URL.createObjectURL(blob)}`;
          p2.appendChild(viewLink);
          document.body.appendChild(p2);
        }),
      );
    });
  });
});
