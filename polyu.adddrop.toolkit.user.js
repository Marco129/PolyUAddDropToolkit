// ==UserScript==
// @icon        https://www38.polyu.edu.hk/eStudent/favicon.ico
// @name        PolyU - Add/Drop Toolkit
// @description Provide useful functions inside add/drop page. DISCLAIMER: All data provided by this script is for reference only. This script do not guarantee the successful of add/drop. You should use this script at your own risk.
// @namespace   polyu.adddrop.toolkit@marco129
// @include     https://www38.polyu.edu.hk/eStudent/secure/my-subject-registration/subject-register-select-subject.jsf
// @updateURL   https://raw.githubusercontent.com/Marco129/PolyUAddDropToolkit/master/polyu.adddrop.toolkit.meta.js
// @downloadURL https://raw.githubusercontent.com/Marco129/PolyUAddDropToolkit/master/polyu.adddrop.toolkit.user.js
// @version     1.1
// @grant       none
// ==/UserScript==

'use strict';

var jq = window.jQuery;
var refresh;

jq(document).ready(function(){
  // Save selected subject info
  jq('input[name$="AddSubjectButton_"]').click(function(){
    sessionStorage['subjectId'] = jq(this).parent().prev().find('select option:first').attr('value');
    sessionStorage['subjectCode'] = jq(this).parent().prev().prev().prev().prev().find('span').text();
    if(jq(this).attr('name').match(/basicSearch/i)){
      sessionStorage['searchType'] = 'basic';
    }else if(jq(this).attr('name').match(/advSearch/i)){
      sessionStorage['searchType'] = 'adv';
    }else if(jq(this).attr('name').match(/retakePass/i)){
      sessionStorage['searchType'] = 'retakePass';
    }
    var idSplit = jq(this).attr('id').split(':');
    sessionStorage['eleId'] = idSplit[0] + ':' + idSplit[1] + ':' + idSplit[2];
  });

  // Clear subject info
  jq('input[name="mainForm:backButton"]').click(function(){
    delete sessionStorage['subjectId'];
    delete sessionStorage['subjectCode'];
    delete sessionStorage['searchType'];
    delete sessionStorage['eleId'];
  });

  // Auto refresh vacancies
  if(jq('table[id$="ComponentTable"]').length === 1 && sessionStorage.length === 4){
    jq('table[id$="ComponentTable"]').next().append('<div style="margin:5px;padding:5px;border:1px dotted #000;line-height:15px;">Add/Drop Toolkit: <span style="color:#008000;">ACTIVE</span><br />DISCLAIMER: All data provided by this script is for reference only. This script do not guarantee the successful of add/drop. You should use this script at your own risk.</div>');
    var viewStateId = parseInt(jq('input[name="javax.faces.ViewState"]').val().replace('j_id', '')) - 1;
    var dataObj = {};
    dataObj['javax.faces.ViewState'] = `j_id${viewStateId}`;
    dataObj['mainForm'] = 'mainForm';
    if(sessionStorage['searchType'] === 'basic'){
      dataObj['mainForm:basicSearchSubjectCode'] = sessionStorage['subjectCode'];
      dataObj[`${sessionStorage['eleId']}:basicSearchAddSubjectButton_`] = '+';
      dataObj[`${sessionStorage['eleId']}:basicSearchSubjectGroup_`] = sessionStorage['subjectId'];
    }else if(sessionStorage['searchType'] === 'adv'){
      dataObj['mainForm:advSearchCategory'] = '';
      dataObj['mainForm:advSearchProgId'] = 0;
      dataObj['mainForm:advSearchSubjectCode'] = '';
      dataObj[`${sessionStorage['eleId']}:advSearchAddSubjectButton_`] = '+';
      dataObj[`${sessionStorage['eleId']}:advSearchSubjectGroup_`] = sessionStorage['subjectId'];
    }else if(sessionStorage['searchType'] === 'retakePass'){
      dataObj[`${sessionStorage['eleId']}:retakePassAddSubjectButton_`] = '+';
      dataObj[`${sessionStorage['eleId']}:retakePassSubjectGroup_`] = sessionStorage['subjectId'];
    }
    refresh = setInterval(function(){
      jq.post('https://www38.polyu.edu.hk/eStudent/secure/my-subject-registration/subject-register-select-subject.jsf', dataObj, function(data){
        if(data.match(/selectCompVacancies_">(\d+)<\/span>/g)){
          var vacancies = data.match(/selectCompVacancies_">(\d+)<\/span>/g);
          jq('[id$="selectCompVacancies_"]').each(function(i){
            jq(this).text(vacancies[i].replace('selectCompVacancies_">', '').replace('</span>', ''));
          });
          var date = new Date();
          jq('table[id$="ComponentTable"] .rich-table-subheadercell:eq(8)').html('Vacancies<br />(' + padNumber(date.getHours(), 2) + ':' + padNumber(date.getMinutes(), 2) + ':' + padNumber(date.getSeconds(), 2)+ ')');
          jq('input[name="javax.faces.ViewState"]').val(data.match(/<input.*name="javax\.faces\.ViewState".*value\n?="(.*)"/)[1]);
        }
      });
    }, 1000);
  }

  // Clear auto refresh vacancies
  jq('input[name="mainForm:selectButton"]').click(function(){
    clearInterval(refresh);
  });
});

// https://github.com/angular/angular.js/blob/0400dc9c2a548a5015d5b73124a1b79f0a68566f/src/ng/filter/filters.js#L230
var padNumber = function (num, digits, trim) {
  var neg = '';
  if (num < 0) {
    neg =  '-';
    num = -num;
  }
  num = '' + num;
  while (num.length < digits) num = '0' + num;
  if (trim) {
    num = num.substr(num.length - digits);
  }
  return neg + num;
};
