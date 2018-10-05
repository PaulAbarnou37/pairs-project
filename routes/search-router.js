const express = require("express");
const Searches = require("../models/searches.js");

const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);

const router = express.Router();

// ---------------------------------------------------------------------------------
// --------------------------------SEARCH PAGE--------------------------------------
// ---------------------------------------------------------------------------------


router.post("/search", (req, res, next) => {
  const { owner, city, startDate, endDate, selectedDays, maxPrice } = req.body;

  Searches.create({ owner, city, startDate, endDate, selectedDays, maxPrice })
    .then(searchesDoc => res.json(searchesDoc))
    .catch(err => next(err));
});

router.post("/searches/:searchId", (req, res, next) => {
  const {searchId} = req.params;
  let resultsRatio = [];
  req.body.forEach(oneResult => {
    // let totalRatioNumber = Number(oneResult.totalMatchRatio);
    return resultsRatio.push(oneResult.totalMatchRatio)
  })

  console.log('This is my resultsRatio', resultsRatio)

  Searches.findByIdAndUpdate(
    searchId,
    { $set: { results: resultsRatio } },
    // "new" gets the updated version of the document
    { runValidators: true, new: true }
  )
    .then(resultDoc => res.json(resultDoc))
    .catch(err => next(err));
});

router.delete("/searches/:searchId", (req, res, next) => {
  const {searchId} = req.params;
  Searches.findByIdAndRemove(searchId)
    .then(searchesDoc => res.json(searchesDoc))
    .catch(err => next(err));
});



// ---------------------------------------------------------------------------------
// ----------------------------RESULTS OF SEARCH PAGE-------------------------------
// ---------------------------------------------------------------------------------



router.get("/searches/:searchId", (req, res, next) => {
  const { _id } = req.user;
  const { searchId } = req.params;

  var searchesPrice = [];
  let dateRange = [];
  let myDateRange ;

  // Find me all the searches that have not been made by me. ( TO CHANGE )
  Searches.find({ owner: { $ne: _id } } )
    .populate('owner')
    .then(searchesDoc => {
      
      // start date - end date => to range 

      searchesDoc.forEach(oneSearch => {
      
       dateRange =  moment.range(oneSearch.startDate, oneSearch.endDate)
       searchesPrice.push({ searchObject: oneSearch, priceMatch: oneSearch.maxPrice, range: dateRange })
      })

      

      // Find the search I've just made 
      return Searches.findById(searchId) 
      .then(mySearch => {
      
        myDateRange = moment.range(mySearch.startDate, mySearch.endDate);
        
        
        
        let allMatches = 
        searchesPrice.map(oneItem => {
          let rangeInCommon = oneItem.range.intersect(myDateRange);
          
          
            if (oneItem.priceMatch > mySearch.maxPrice){
              return ({
                searchObject: oneItem.searchObject,
                mySearch: mySearch,
                priceMatch: ((mySearch.maxPrice / oneItem.priceMatch ) * 100),
                dateRangeMatch : {dateRangeIntersection: rangeInCommon, myStartToEndDate: (mySearch.endDate - mySearch.startDate)/1000/60/60/24},
              })
            } else { 
              return ({
                searchObject: oneItem.searchObject,
                mySearch: mySearch,
                priceMatch: ((oneItem.priceMatch / mySearch.maxPrice) * 100),
                dateRangeMatch : {dateRangeIntersection: rangeInCommon, myStartToEndDate: (mySearch.endDate - mySearch.startDate)/1000/60/60/24},
              })
              }
            
          });

          // FILTER DATE RANGE IN COMMON = TRUE

        matchesRatios = allMatches.filter(oneThing => (oneThing.dateRangeMatch.dateRangeIntersection));
        
        //--------------------------------------------
        // INSERT INTO ARRAY - SELECTED DAYS IN RANGE
        //--------------------------------------------

        matchesRatios.forEach(oneSearch => {
          let theCommonRange = moment.range(
            oneSearch.dateRangeMatch.dateRangeIntersection.start, 
            oneSearch.dateRangeMatch.dateRangeIntersection.end);

            function findDuplicatedDates(arra1) {
              var object = {};
              var result = [];
        
              arra1.forEach(function (item) {
                if(!object[item])
                    object[item] = 0;
                  object[item] += 1;
              })
        
              for (var prop in object) {
                 if(object[prop] >= 2) {
                     result.push(prop);
                 }
              }
        
              if (result.length === 0){
                return 0
              } else {
                let numberDuplicates = result.length;
                return numberDuplicates
              };
          }

          function findDuplicatedDatesArray(arra1) {
            var object = {};
            var result = [];
      
            arra1.forEach(function (item) {
              item = item.slice(0, 10)
              if(!object[item])
                  object[item] = 0;
                object[item] += 1;
            })
      
            for (var prop in object) {
               if(object[prop] >= 2) {
                   result.push(prop);
               }
            }
      
            if (result.length === 0){
              return 0
            } else {
              return result
            };
        }

          let commonRangeInDays = (new Date(oneSearch.dateRangeMatch.dateRangeIntersection.end) - new Date(oneSearch.dateRangeMatch.dateRangeIntersection.start))/1000/60/60/24;


              oneSearch.searchesSelectedDaysInRange = oneSearch.searchObject.selectedDays
              .filter(oneDay => {
                return (
              moment(oneDay).within(theCommonRange)
              )})
              oneSearch.mySelectedDaysInRange = oneSearch.mySearch.selectedDays
              .filter(oneDate => {
                return (
              moment(oneDate).within(moment.range(
                oneSearch.dateRangeMatch.dateRangeIntersection.start, 
                oneSearch.dateRangeMatch.dateRangeIntersection.end)) 
                )})
              
              oneSearch.bothSelectedDays = oneSearch.searchesSelectedDaysInRange.concat(oneSearch.mySelectedDaysInRange);

              if (commonRangeInDays < oneSearch.bothSelectedDays.length || commonRangeInDays === oneSearch.bothSelectedDays.length){
                oneSearch.scoreSelectedDays = ((( oneSearch.bothSelectedDays.length - findDuplicatedDates(oneSearch.bothSelectedDays)*2 - (oneSearch.bothSelectedDays.length - (oneSearch.bothSelectedDays.length - findDuplicatedDates(oneSearch.bothSelectedDays)))*0,5 ))*100)/oneSearch.bothSelectedDays.length;
                oneSearch.duplicatedDays = findDuplicatedDatesArray(oneSearch.bothSelectedDays)
              } else if (commonRangeInDays > oneSearch.bothSelectedDays.length) {
                oneSearch.scoreSelectedDays = ((commonRangeInDays - (commonRangeInDays - oneSearch.bothSelectedDays.length) - findDuplicatedDates(oneSearch.bothSelectedDays)*2)*100)/commonRangeInDays;
                oneSearch.duplicatedDays = findDuplicatedDatesArray(oneSearch.bothSelectedDays)
              } else {console.log('Common Range Length:', commonRangeInDays)};

        })

            // console.log('HEY HEY THIS IS A TEST', matchesRatios);
              res.json(matchesRatios)
            })   
    })


    .catch(err => next(err));
});


router.get("/mysearches", (req, res, next) => {
const { _id } = req.user;
Searches.find({ owner: { $eq: _id } } )
    .then(mySearchesDoc => {
      console.log('This is my searches doc', mySearchesDoc)
      res.json(mySearchesDoc)
    })
    .catch(err => next(err));
  });







module.exports = router ;
