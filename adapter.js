const createTable = (name) => `
CREATE TABLE IF NOT EXISTS ${name} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT,
  value TEXT,
  ttl INTEGER
)
`;
const insertDoc = (table) => `
insert into ${table} (key,value) values (?, ?)`;

export default (db) => {
  const createStore = (name) => {
    try {
      db.query(createTable(name));
      return Promise.resolve(({ ok: true }));
    } catch (_e) {
      return Promise.reject({
        ok: false,
        status: 500,
        msg: "Could not create store!",
      });
    }
  };

  const createDoc = ({ store, key, value, ttl }) => {
    try {
      console.log("TODO: implement ttl", ttl);
      db.query(insertDoc(store), [key, JSON.stringify(value)]); //ttl
      return Promise.resolve({ ok: true });
    } catch (_e) {
      return Promise.resolve({ ok: false, status: 409 });
    }
  };

  const deleteDoc = ({ store, key }) => {
    //const res = await stores[store].del(key)
    db.query(`delete from ${store} where key = ?`, [key]);
    return Promise.resolve({ ok: true });
  };

  const getDoc = ({ store, key }) => {
    try {
      const res = db.query(`select value from ${store} where key = ?`, [key]);
      return Promise.resolve(JSON.parse(res[0][0]));
    } catch (_e) {
      return Promise.reject({
        ok: false,
        status: 404,
        msg: "document not found",
      });
    }
  };

  const updateDoc = ({ store, key, value, ttl }) => {
    try {
      const res = db.query(`select id, value from ${store} where key = ?`, [
        key,
      ]);
      if (res.length === 0) throw new Error("not found");
      const [id] = res[0];
      const cur = JSON.parse(res[0][1]);
      value = { ...cur, ...value };
      const _ = db.query(
        `update ${store} set value = ?, ttl = ? where id = ?`,
        [JSON.stringify(value), ttl, id],
      );
      return Promise.resolve({ ok: true });
    } catch (_e) {
      return Promise.reject({
        ok: false,
        status: 404,
        msg: "document not found",
      });
    }
  };

  const listDocs = ({ store, pattern }) => {
    try {
      const res = db.query(`select key, value from ${store} where key like ?`, [
        pattern.replace("*", "%"),
      ]);
      const toObject = ([k, v]) => ({ key: k, value: JSON.parse(v) });
      return Promise.resolve({
        ok: true,
        docs: res.map(toObject),
      });
    } catch (_e) {
      return Promise.reject({
        ok: false,
        status: 400,
        msg: "cache not created",
      });
    }
  };
  return {
    createStore,
    createDoc,
    deleteDoc,
    getDoc,
    updateDoc,
    listDocs,
  };
};
