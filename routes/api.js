'use strict';

const dns = require('dns');
const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

dns.setServers(["8.8.8.8", "8.8.4.4"]);

let database;

new MongoClient(process.env.MONGODB_URI).connect()
  .then((client) => {
    database = client.db('issue_tracker');
    console.log('Connected to database');
  })
  .catch((err) => console.error(err));

function checkProjectParam(req, res, next) {
  const { project } = req.params;

  if (!project) {
    return res.json({ error: "Project name is required." });
  }

  next();
}

async function checkIdParam(req, res, next) {
  const { _id } = req.body;

  if (!_id) {
    return res.json({ error: "missing _id" });
  }

  next();
}

module.exports = function (app) {
  app.route('/api/issues/:project')
    .get(checkProjectParam, async function (req, res) {
      try {
        const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.query;
        const query = {};

        if (_id) query._id = ObjectId.createFromHexString(_id);
        if (issue_title) query.issue_title = { $regex: new RegExp(issue_title, 'i') };
        if (issue_text) query.issue_text = { $regex: new RegExp(issue_text, 'i') };
        if (created_by) query.created_by = created_by;
        if (assigned_to) query.assigned_to = assigned_to;
        if (status_text) query.status_text = status_text;
        if (open) query.open = open === 'true';

        const issues = await database.collection(req.params.project).find(query).toArray();

        return res.json(issues);
      } catch (err) {
        console.error(err);
      }
    })

    .post(checkProjectParam, async function (req, res) {
      try {
        const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

        if (!issue_title || !issue_text || !created_by) {
          return res.json({ error: "required field(s) missing" });
        }

        const result = await database.collection(req.params.project).insertOne({
          issue_title,
          issue_text,
          created_by,
          assigned_to: assigned_to ?? '',
          status_text: status_text ?? '',
          open: true,
          created_on: new Date(),
          updated_on: new Date()
        });

        return res.json(await database.collection(req.params.project).findOne({ _id: result.insertedId }));
      } catch (err) {
        console.error(err);
      }
    })

    .put(checkIdParam, async function (req, res) {
      try {
        const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;

        if (!issue_title && !issue_text && !created_by && !assigned_to && !status_text && !open) {
          return res.json({ error: "no update field(s) sent", _id });
        }

        if (!req.params.project
          || !ObjectId.isValid(_id)
          || !await database.collection(req.params.project).findOne({ _id: ObjectId.createFromHexString(_id) })) {
          return res.json({ error: "could not update", _id });
        }

        const newIssue = {
          open: open === 'false' ? false : true,
          updated_on: new Date()
        };

        if (issue_title) newIssue.issue_title = issue_title;
        if (issue_text) newIssue.issue_text = issue_text;
        if (created_by) newIssue.created_by = created_by;
        if (assigned_to) newIssue.assigned_to = assigned_to;
        if (status_text) newIssue.status_text = status_text;

        await database.collection(req.params.project).findOneAndUpdate(
          { _id: ObjectId.createFromHexString(_id) },
          { $set: newIssue },
        );

        return res.json({ result: "successfully updated", _id });
      } catch (err) {
        console.error(err);
      }
    })

    .delete(checkIdParam, async function (req, res) {
      try {
        const { _id } = req.body;

        if (!req.params.project
          || !ObjectId.isValid(_id)
          || !await database.collection(req.params.project).findOne({ _id: ObjectId.createFromHexString(_id) })) {
          return res.json({ error: "could not delete", _id });
        }

        await database.collection(req.params.project).findOneAndDelete({ _id: ObjectId.createFromHexString(_id) });

        return res.json({ result: "successfully deleted", _id });
      } catch (err) {
        console.error(err);
      }
    });
};
