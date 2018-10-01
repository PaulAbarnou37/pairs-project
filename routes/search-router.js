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
  Searches.find({ owner: { $eq: _id } } )
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
              

        })

            console.log('These are my data received in the front', matchesRatios);
              res.json(matchesRatios)
            })   
    })


    .catch(err => next(err));
});



module.exports = router ;
