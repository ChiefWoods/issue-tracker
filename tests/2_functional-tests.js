const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server.js');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  let issues = [];

  test('Create an issue with every field', function (done) {
    chai
      .request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title: 'Test title',
        issue_text: 'Test text',
        created_by: 'Chai',
        assigned_to: 'Chai',
        status_text: 'Test open'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Test title');
        assert.equal(res.body.issue_text, 'Test text');
        assert.equal(res.body.created_by, 'Chai');
        assert.equal(res.body.assigned_to, 'Chai');
        assert.equal(res.body.status_text, 'Test open');
        assert.equal(res.body.open, true);
        issues.push(res.body._id);
        done();
      });
  });

  test('Create an issue with required fields only', function (done) {
    chai
      .request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title: 'Test title',
        issue_text: 'Test text',
        created_by: 'Chai',
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Test title');
        assert.equal(res.body.issue_text, 'Test text');
        assert.equal(res.body.created_by, 'Chai');
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status_text, '');
        assert.equal(res.body.open, true);
        issues.push(res.body._id);
        done();
      });
  });

  test('Create an issue with missing required fields', function (done) {
    chai
      .request(server)
      .post('/api/issues/apitest')
      .send({
        title: 'Test title',
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  test('View issues on a project', function (done) {
    chai
      .request(server)
      .get('/api/issues/apitest')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(issue => {
          assert.containsAllKeys(issue, ['_id', 'issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text', 'open', 'created_on', 'updated_on']);
        });
        done();
      });
  });

  test('View issues on a project with one filter', function (done) {
    chai
      .request(server)
      .get('/api/issues/apitest')
      .query({ created_by: 'Chai' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(issue => {
          assert.containsAllKeys(issue, ['_id', 'issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text', 'open', 'created_on', 'updated_on']);
          assert.equal(issue.created_by, 'Chai');
        });
        done();
      });
  });

  test('View issues on a project with multiple filters', function (done) {
    chai
      .request(server)
      .get('/api/issues/apitest')
      .query({ issue_text: 'Test text', created_by: 'Chai' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(issue => {
          assert.containsAllKeys(issue, ['_id', 'issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text', 'open', 'created_on', 'updated_on']);
          assert.equal(issue.issue_text, 'Test text');
          assert.equal(issue.created_by, 'Chai');
        });
        done();
      });
  });

  test('Update one field on an issue', function (done) {
    const _id = issues[0];

    chai
      .request(server)
      .put('/api/issues/apitest')
      .send({
        _id,
        issue_title: 'Updated test title'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, _id);
        done();
      });
  });

  test('Update multiple fields on an issue', function (done) {
    const _id = issues[1];

    chai
      .request(server)
      .put('/api/issues/apitest')
      .send({
        _id,
        issue_title: 'Updated test title',
        issue_text: 'Updated test text',
        created_by: 'Updated Chai',
        assigned_to: 'Updated Chai',
        status_text: 'Updated test open',
        open: true
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, _id);
        done();
      });
  });

  test('Update an issue with missing _id', function (done) {
    chai
      .request(server)
      .put('/api/issues/apitest')
      .send({
        issue_title: 'Updated test title'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  test('Update an issue with no fields to update', function (done) {
    const _id = issues[1];

    chai
      .request(server)
      .put('/api/issues/apitest')
      .send({
        _id
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'no update field(s) sent');
        done();
      });
  });

  test('Update an issue with invalid _id', function (done) {
    chai
      .request(server)
      .put('/api/issues/apitest')
      .send({
        _id: 'invalid id',
        issue_title: 'Updated test title'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not update');
        done();
      });
  });

  test('Delete an issue', function (done) {
    const _id = issues[0];

    chai
      .request(server)
      .delete('/api/issues/apitest')
      .send({ _id })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully deleted');
        assert.equal(res.body._id, _id);
        done();
      });
  });

  test('Delete an issue with an invalid _id', function (done) {
    chai
      .request(server)
      .delete('/api/issues/apitest')
      .send({ _id: 'invalid id' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not delete');
        done();
      });
  });

  test('Delete an issue with missing _id', function (done) {
    chai
      .request(server)
      .delete('/api/issues/apitest')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });
});