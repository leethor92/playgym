'use strict';

const accounts = require('./accounts');
const logger = require('../utils/logger');
const userstore = require('../models/user-store');
const assessmentstore = require('../models/assessment-store');
const analyticshelper = require('../utils/analyticshelper');
const goalstore = require('../models/goal-store');
const uuid = require('uuid');

const trainerdashboard = {
  index(request, response) {
    logger.info('dashboard rendering');
    const loggedintrainer = accounts.getCurrentTrainer(request);
    const members = userstore.getAllMembers();
    for (let i = 0; i < members.length; i++) {
      members[i].assessmentssize = assessmentstore.getSortedAssessments(members[i].id).length;
    };

    const viewData = {
      title: 'Gym App Trainer Dashboard',
      trainer: loggedintrainer,
      members: members,
    };
    response.render('trainerdashboard', viewData);
  },

  viewMember(request, response) {
    logger.info('Member view rendering');
    const memberId = request.params.id;
    const member = accounts.getMember(memberId);
    const viewData = {
      title: 'Gym App Trainer Dashboard',
      member: member,
      assessments: assessmentstore.getSortedAssessments(memberId),
      bmi: analyticshelper.calculateBMI(member),
      bmiCategory: analyticshelper.getBMICategory(member),
      idealWeightIndicator: analyticshelper.isIdealBodyWeight(member),
      goals: goalstore.getSortedGoals(memberId),
    };
    response.render('viewmember', viewData);
  },
  
  addGoal (request, response) {
    const memberId = request.parms.memberid
    const goal = {
      goalId: uuid(),
      date: (new Date(), 'ddd, dd mmm yyyy HH:MM:ss Z'),
      weight: request.body.weight,
      chest: request.body.chest,
      thigh: request.body.thigh,
      upperArm: request.body.upperArm,
      waist: request.body.waist,
      hips: request.body.hips,
      tolerance: request.body.tolerance,
      description: request.body.description,
    }
    goalstore.addGoal(memberId, goal);
    response.redirect('/viewmember/' + memberId);
  },

  updateComment(request, response) {
    //logger.info(request);
    const assessmentId = request.params.assessmentId;
    const memberId = request.params.id;
    const comment = request.body.comment;

    assessmentstore.setComment(memberId, assessmentId, comment);

    logger.info('Updating comment');
    response.redirect(`/viewMember/${memberId}`);
  },
};

module.exports = trainerdashboard;