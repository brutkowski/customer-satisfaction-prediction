'use strict';

require('./helpers');
var chai = require('chai');
var expect = chai.expect;
var nock = require('nock');

var PMClient = require('../server/pm_client');

var PM_ENV = {
  name: 'Predictive Analytics-l1',
  label: 'pm-20',
  credentials: {
    access_key: 'my-key',
    url: 'https://example.ibmcloud.com/pm/v1'
  }
};

var TEST_MODELS = [
  {
    id: '123',
    stream: 'test.sev',
    tableData: {
      trainingInput: {
        'Age': 'LONG',
        'Sex': 'STRING',
        'BP': 'STRING',
        'Cholesterol': 'STRING',
        'Na': 'DOUBLE',
        'K': 'DOUBLE',
        'Drug': 'STRING'
      },
      scoreInput: {
        'Age': 'LONG',
        'Sex': 'STRING',
        'BP': 'STRING',
        'Cholesterol': 'STRING',
        'Na': 'DOUBLE',
        'K': 'DOUBLE'
      }
    }
  }
];

var TEST_MODEL_METADATE = {
  flag: true,
  message: '<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><metadata xmlns=\"http://spss.ibm.com/meta/internal\"><table name=\"trainingInput\"><field name=\"Age\" storageType=\"LONG\" measurementLevel=\"CONTINUOUS\"/><field name=\"Sex\" storageType=\"STRING\" measurementLevel=\"FLAG\"/><field name=\"BP\" storageType=\"STRING\" measurementLevel=\"NOMINAL\"/><field name=\"Cholesterol\" storageType=\"STRING\" measurementLevel=\"FLAG\"/><field name=\"Na\" storageType=\"DOUBLE\" measurementLevel=\"CONTINUOUS\"/><field name=\"K\" storageType=\"DOUBLE\" measurementLevel=\"CONTINUOUS\"/><field name=\"Drug\" storageType=\"STRING\" measurementLevel=\"NOMINAL\"/></table><table name=\"scoreInput\"><field name=\"Age\" storageType=\"LONG\" measurementLevel=\"CONTINUOUS\"/><field name=\"Sex\" storageType=\"STRING\" measurementLevel=\"FLAG\"/><field name=\"BP\" storageType=\"STRING\" measurementLevel=\"NOMINAL\"/><field name=\"Cholesterol\" storageType=\"STRING\" measurementLevel=\"FLAG\"/><field name=\"Na\" storageType=\"DOUBLE\" measurementLevel=\"CONTINUOUS\"/><field name=\"K\" storageType=\"DOUBLE\" measurementLevel=\"CONTINUOUS\"/></table></metadata>'
};

describe('Application', function () {
  before(function () {
    this.pmClient = new PMClient(PM_ENV);
  });

  it('should get models', function (done) {
    nock('https://example.ibmcloud.com')
      .get('/pm/v1/model/?accesskey=%22my-key%22')
      .reply(200, TEST_MODELS);
    nock('https://example.ibmcloud.com').get(
      '/pm/v1/metadata/123?accesskey=%22my-key%22').reply(200,
      TEST_MODEL_METADATE);
    this.pmClient.getModels(function (err, models) {
      if (err) {
        done(err);
      } else {
        expect(models).to.be.an('array');
        expect(models.length).to.eql(1);
        expect(models[0].id).to.eql('123');
        expect(models[0].tableData).to.be.an('object');
        done();
      }
    });
  });

  it('should get model meta-data', function (done) {
    nock('https://example.ibmcloud.com').get(
        '/pm/v1/metadata/123?accesskey=%22my-key%22').reply(200,
        TEST_MODEL_METADATE);
    this.pmClient.getModel('123', function (err, model) {
      if (err) {
        done(err);
      } else {
        expect(model.id).to.eql('123');
        expect(model.tableData).to.be.an('object');
        expect(model.tableData.trainingInput).to.be.an('object');
        done();
      }
    });
  });
});
