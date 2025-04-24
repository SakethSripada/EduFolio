INSERT INTO colleges (
    id, name, location, type, size, acceptance_rate, ranking, tuition,
    logo_url, website_url, created_at, updated_at
) VALUES
-- 1. Princeton University
(gen_random_uuid(), 'Princeton University', 'Princeton, NJ', 'Private', 'Medium', 0.04, 1, 53790, 'https://example.com/logos/princeton.png', 'https://www.princeton.edu', NOW(), NOW()),

-- 2. Massachusetts Institute of Technology (MIT)
(gen_random_uuid(), 'Massachusetts Institute of Technology', 'Cambridge, MA', 'Private', 'Medium', 0.07, 2, 53790, 'https://example.com/logos/mit.png', 'https://www.mit.edu', NOW(), NOW()),

-- 3. Harvard University
(gen_random_uuid(), 'Harvard University', 'Cambridge, MA', 'Private', 'Medium', 0.05, 3, 53790, 'https://example.com/logos/harvard.png', 'https://www.harvard.edu', NOW(), NOW()),

-- 4. Stanford University
(gen_random_uuid(), 'Stanford University', 'Stanford, CA', 'Private', 'Large', 0.05, 4, 53790, 'https://example.com/logos/stanford.png', 'https://www.stanford.edu', NOW(), NOW()),

-- 5. Yale University
(gen_random_uuid(), 'Yale University', 'New Haven, CT', 'Private', 'Medium', 0.06, 5, 53790, 'https://example.com/logos/yale.png', 'https://www.yale.edu', NOW(), NOW()),

-- 6. University of Chicago
(gen_random_uuid(), 'University of Chicago', 'Chicago, IL', 'Private', 'Medium', 0.06, 6, 60000, 'https://example.com/logos/uchicago.png', 'https://www.uchicago.edu', NOW(), NOW()),

-- 7. Johns Hopkins University
(gen_random_uuid(), 'Johns Hopkins University', 'Baltimore, MD', 'Private', 'Large', 0.11, 7, 60960, 'https://example.com/logos/jhu.png', 'https://www.jhu.edu', NOW(), NOW()),

-- 8. University of Pennsylvania
(gen_random_uuid(), 'University of Pennsylvania', 'Philadelphia, PA', 'Private', 'Large', 0.07, 8, 63844, 'https://example.com/logos/upenn.png', 'https://www.upenn.edu', NOW(), NOW()),

-- 9. California Institute of Technology (Caltech)
(gen_random_uuid(), 'California Institute of Technology', 'Pasadena, CA', 'Private', 'Small', 0.06, 9, 60100, 'https://example.com/logos/caltech.png', 'https://www.caltech.edu', NOW(), NOW()),

-- 10. Duke University
(gen_random_uuid(), 'Duke University', 'Durham, NC', 'Private', 'Medium', 0.08, 10, 63576, 'https://example.com/logos/duke.png', 'https://www.duke.edu', NOW(), NOW()),

-- 11. Northwestern University
(gen_random_uuid(), 'Northwestern University', 'Evanston, IL', 'Private', 'Large', 0.07, 11, 63947, 'https://example.com/logos/northwestern.png', 'https://www.northwestern.edu', NOW(), NOW()),

-- 12. Dartmouth College
(gen_random_uuid(), 'Dartmouth College', 'Hanover, NH', 'Private', 'Small', 0.09, 12, 63460, 'https://example.com/logos/dartmouth.png', 'https://home.dartmouth.edu', NOW(), NOW()),

-- 13. Brown University
(gen_random_uuid(), 'Brown University', 'Providence, RI', 'Private', 'Medium', 0.06, 13, 65346, 'https://example.com/logos/brown.png', 'https://www.brown.edu', NOW(), NOW()),

-- 14. Vanderbilt University
(gen_random_uuid(), 'Vanderbilt University', 'Nashville, TN', 'Private', 'Medium', 0.10, 14, 65400, 'https://example.com/logos/vanderbilt.png', 'https://www.vanderbilt.edu', NOW(), NOW()),

-- 15. Rice University
(gen_random_uuid(), 'Rice University', 'Houston, TX', 'Private', 'Medium', 0.09, 15, 55858, 'https://example.com/logos/rice.png', 'https://www.rice.edu', NOW(), NOW()),

-- 16. Washington University in St. Louis
(gen_random_uuid(), 'Washington University in St. Louis', 'St. Louis, MO', 'Private', 'Medium', 0.13, 16, 64258, 'https://example.com/logos/wustl.png', 'https://wustl.edu', NOW(), NOW()),

-- 17. Cornell University
(gen_random_uuid(), 'Cornell University', 'Ithaca, NY', 'Private', 'Large', 0.09, 17, 65104, 'https://example.com/logos/cornell.png', 'https://www.cornell.edu', NOW(), NOW()),

-- 18. Columbia University
(gen_random_uuid(), 'Columbia University', 'New York, NY', 'Private', 'Large', 0.05, 18, 65424, 'https://example.com/logos/columbia.png', 'https://www.columbia.edu', NOW(), NOW()),

-- 19. University of Notre Dame
(gen_random_uuid(), 'University of Notre Dame', 'Notre Dame, IN', 'Private', 'Medium', 0.15, 19, 61760, 'https://example.com/logos/notredame.png', 'https://www.nd.edu', NOW(), NOW()),

-- 20. University of California, Berkeley
(gen_random_uuid(), 'University of California, Berkeley', 'Berkeley, CA', 'Public', 'Large', 0.11, 20, 17480, 'https://example.com/logos/ucberkeley.png', 'https://www.berkeley.edu', NOW(), NOW()),

-- 21. University of California, Los Angeles (UCLA)
(gen_random_uuid(), 'University of California, Los Angeles', 'Los Angeles, CA', 'Public', 'Large', 0.09, 21, 13780, 'https://example.com/logos/ucla.png', 'https://www.ucla.edu', NOW(), NOW()),

-- 22. Emory University
(gen_random_uuid(), 'Emory University', 'Atlanta, GA', 'Private', 'Medium', 0.13, 22, 57948, 'https://example.com/logos/emory.png', 'https://www.emory.edu', NOW(), NOW()),

-- 23. University of Southern California
(gen_random_uuid(), 'University of Southern California', 'Los Angeles, CA', 'Private', 'Large', 0.12, 23, 65349, 'https://example.com/logos/usc.png', 'https://www.usc.edu', NOW(), NOW()),

-- 24. Carnegie Mellon University
(gen_random_uuid(), 'Carnegie Mellon University', 'Pittsburgh, PA', 'Private', 'Medium', 0.14, 24, 63480, 'https://example.com/logos/cmu.png', 'https://www.cmu.edu', NOW(), NOW()),

-- 25. Georgetown University
(gen_random_uuid(), 'Georgetown University', 'Washington, DC', 'Private', 'Medium', 0.13, 25, 63428, 'https://example.com/logos/georgetown.png', 'https://www.georgetown.edu', NOW(), NOW()),

-- 26. University of Michigan
(gen_random_uuid(), 'University of Michigan', 'Ann Arbor, MI', 'Public', 'Large', 0.20, 26, 17983, 'https://example.com/logos/umich.png', 'https://umich.edu', NOW(), NOW()),

-- 27. Wake Forest University
(gen_random_uuid(), 'Wake Forest University', 'Winston-Salem, NC', 'Private', 'Medium', 0.29, 27, 63962, 'https://example.com/logos/wfu.png', 'https://www.wfu.edu', NOW(), NOW()),

-- 28. University of North Carolina at Chapel Hill
(gen_random_uuid(), 'University of North Carolina at Chapel Hill', 'Chapel Hill, NC', 'Public', 'Large', 0.19, 28, 9156, 'https://example.com/logos/unc.png', 'https://www.unc.edu', NOW(), NOW()),

-- 29. Tufts University
(gen_random_uuid(), 'Tufts University', 'Medford, MA', 'Private', 'Medium', 0.16, 29, 66358, 'https://example.com/logos/tufts.png', 'https://www.tufts.edu', NOW(), NOW()),

-- 30. University of Florida
(gen_random_uuid(), 'University of Florida', 'Gainesville, FL', 'Public', 'Large', 0.30, 30, 64710, 'https://example.com/logos/uf.png', 'https://www.ufl.edu', NOW(), NOW());

(gen_random_uuid(), 'Boston College', 'Chestnut Hill, MA', 'Private', 'Medium', 0.27, 31, 61270, 'https://example.com/logos/bostoncollege.png', 'https://www.bc.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Wisconsin–Madison', 'Madison, WI', 'Public', 'Large', 0.54, 32, 10896, 'https://example.com/logos/uwmadison.png', 'https://www.wisc.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Illinois Urbana-Champaign', 'Champaign, IL', 'Public', 'Large', 0.59, 33, 17040, 'https://example.com/logos/uiuc.png', 'https://illinois.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Miami', 'Coral Gables, FL', 'Private', 'Large', 0.33, 34, 54760, 'https://example.com/logos/miami.png', 'https://www.miami.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Georgia', 'Athens, GA', 'Public', 'Large', 0.45, 35, 11530, 'https://example.com/logos/uga.png', 'https://www.uga.edu', NOW(), NOW()),
(gen_random_uuid(), 'Lehigh University', 'Bethlehem, PA', 'Private', 'Medium', 0.32, 36, 56290, 'https://example.com/logos/lehigh.png', 'https://www.lehigh.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of California, Santa Barbara', 'Santa Barbara, CA', 'Public', 'Large', 0.29, 37, 14450, 'https://example.com/logos/ucsb.png', 'https://www.ucsb.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of California, Irvine', 'Irvine, CA', 'Public', 'Large', 0.29, 38, 13900, 'https://example.com/logos/uci.png', 'https://www.uci.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of California, Davis', 'Davis, CA', 'Public', 'Large', 0.39, 39, 14400, 'https://example.com/logos/ucdavis.png', 'https://www.ucdavis.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Texas at Austin', 'Austin, TX', 'Public', 'Large', 0.32, 40, 11200, 'https://example.com/logos/utexas.png', 'https://www.utexas.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Washington', 'Seattle, WA', 'Public', 'Large', 0.49, 41, 11200, 'https://example.com/logos/uw.png', 'https://www.washington.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Connecticut', 'Storrs, CT', 'Public', 'Large', 0.56, 42, 17000, 'https://example.com/logos/uconn.png', 'https://www.uconn.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Maryland, College Park', 'College Park, MD', 'Public', 'Large', 0.44, 43, 11200, 'https://example.com/logos/umd.png', 'https://www.umd.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Pittsburgh', 'Pittsburgh, PA', 'Public', 'Large', 0.59, 44, 19400, 'https://example.com/logos/pitt.png', 'https://www.pitt.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Minnesota, Twin Cities', 'Minneapolis, MN', 'Public', 'Large', 0.57, 45, 15700, 'https://example.com/logos/umn.png', 'https://twin-cities.umn.edu', NOW(), NOW()),
(gen_random_uuid(), 'Michigan State University', 'East Lansing, MI', 'Public', 'Large', 0.71, 46, 14700, 'https://example.com/logos/msu.png', 'https://www.msu.edu', NOW(), NOW()),
(gen_random_uuid(), 'Indiana University Bloomington', 'Bloomington, IN', 'Public', 'Large', 0.78, 47, 11000, 'https://example.com/logos/iub.png', 'https://www.indiana.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Delaware', 'Newark, DE', 'Public', 'Large', 0.66, 48, 14000, 'https://example.com/logos/udel.png', 'https://www.udel.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Colorado Boulder', 'Boulder, CO', 'Public', 'Large', 0.80, 49, 12000, 'https://example.com/logos/cuboulder.png', 'https://www.colorado.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Iowa', 'Iowa City, IA', 'Public', 'Large', 0.83, 50, 9500, 'https://example.com/logos/uiowa.png', 'https://www.uiowa.edu', NOW(), NOW()),
(gen_random_uuid(), 'Clemson University', 'Clemson, SC', 'Public', 'Medium', 0.47, 51, 16250, 'https://example.com/logos/clemson.png', 'https://www.clemson.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Rochester', 'Rochester, NY', 'Private', 'Medium', 0.39, 52, 55960, 'https://example.com/logos/rochester.png', 'https://www.rochester.edu', NOW(), NOW()),
(gen_random_uuid(), 'Boston University', 'Boston, MA', 'Private', 'Large', 0.20, 53, 61750, 'https://example.com/logos/bu.png', 'https://www.bu.edu', NOW(), NOW()),
(gen_random_uuid(), 'Brandeis University', 'Waltham, MA', 'Private', 'Small', 0.29, 54, 57340, 'https://example.com/logos/brandeis.png', 'https://www.brandeis.edu', NOW(), NOW()),
(gen_random_uuid(), 'Rensselaer Polytechnic Institute', 'Troy, NY', 'Private', 'Small', 0.39, 55, 58100, 'https://example.com/logos/rpi.png', 'https://www.rpi.edu', NOW(), NOW()),
(gen_random_uuid(), 'Northeastern University', 'Boston, MA', 'Private', 'Large', 0.19, 56, 61500, 'https://example.com/logos/northeastern.png', 'https://www.northeastern.edu', NOW(), NOW()),
(gen_random_uuid(), 'Tulane University', 'New Orleans, LA', 'Private', 'Medium', 0.13, 57, 59498, 'https://example.com/logos/tulane.png', 'https://www.tulane.edu', NOW(), NOW()),
(gen_random_uuid(), 'Pepperdine University', 'Malibu, CA', 'Private', 'Small', 0.33, 58, 55854, 'https://example.com/logos/pepperdine.png', 'https://www.pepperdine.edu', NOW(), NOW()),
(gen_random_uuid(), 'Case Western Reserve University', 'Cleveland, OH', 'Private', 'Medium', 0.29, 59, 59926, 'https://example.com/logos/casewestern.png', 'https://case.edu', NOW(), NOW()),
(gen_random_uuid(), 'Villanova University', 'Villanova, PA', 'Private', 'Medium', 0.27, 60, 55597, 'https://example.com/logos/villanova.png', 'https://www.villanova.edu', NOW(), NOW()),
(gen_random_uuid(), 'Worcester Polytechnic Institute', 'Worcester, MA', 'Private', 'Small', 0.41, 61, 57114, 'https://example.com/logos/wpi.png', 'https://www.wpi.edu', NOW(), NOW()),
(gen_random_uuid(), 'George Washington University', 'Washington, DC', 'Private', 'Large', 0.41, 62, 58500, 'https://example.com/logos/gwu.png', 'https://www.gwu.edu', NOW(), NOW()),
(gen_random_uuid(), 'Baylor University', 'Waco, TX', 'Private', 'Large', 0.71, 63, 49500, 'https://example.com/logos/baylor.png', 'https://www.baylor.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Tulsa', 'Tulsa, OK', 'Private', 'Small', 0.63, 64, 49000, 'https://example.com/logos/tulsa.png', 'https://www.utulsa.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of San Diego', 'San Diego, CA', 'Private', 'Medium', 0.58, 65, 58660, 'https://example.com/logos/usd.png', 'https://www.sandiego.edu', NOW(), NOW());
(gen_random_uuid(), 'Southern Methodist University', 'Dallas, TX', 'Private', 'Medium', 0.49, 66, 57500, 'https://example.com/logos/smu.png', 'https://www.smu.edu', NOW(), NOW()),
(gen_random_uuid(), 'California Institute of the Arts', 'Valencia, CA', 'Private', 'Small', 0.52, 67, 39916, 'https://example.com/logos/ciart.png', 'https://www.calarts.edu', NOW(), NOW()),
(gen_random_uuid(), 'Fordham University', 'Bronx, NY', 'Private', 'Medium', 0.46, 68, 57700, 'https://example.com/logos/fordham.png', 'https://www.fordham.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of California, Santa Cruz', 'Santa Cruz, CA', 'Public', 'Medium', 0.51, 69, 14768, 'https://example.com/logos/ucsc.png', 'https://www.ucsc.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Massachusetts Amherst', 'Amherst, MA', 'Public', 'Large', 0.58, 70, 16236, 'https://example.com/logos/umass.png', 'https://www.umass.edu', NOW(), NOW()),
(gen_random_uuid(), 'Virginia Tech', 'Blacksburg, VA', 'Public', 'Large', 0.63, 71, 13030, 'https://example.com/logos/vt.png', 'https://www.vt.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Colorado Denver', 'Denver, CO', 'Public', 'Large', 0.76, 72, 11200, 'https://example.com/logos/ucdenver.png', 'https://www.ucdenver.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Arizona', 'Tucson, AZ', 'Public', 'Large', 0.84, 73, 12420, 'https://example.com/logos/arizona.png', 'https://www.arizona.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Oregon', 'Eugene, OR', 'Public', 'Large', 0.83, 74, 13000, 'https://example.com/logos/oregon.png', 'https://www.uoregon.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Tennessee', 'Knoxville, TN', 'Public', 'Large', 0.76, 75, 12500, 'https://example.com/logos/tennessee.png', 'https://www.utk.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Kentucky', 'Lexington, KY', 'Public', 'Large', 0.94, 76, 12100, 'https://example.com/logos/uky.png', 'https://www.uky.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Nebraska–Lincoln', 'Lincoln, NE', 'Public', 'Large', 0.84, 77, 11400, 'https://example.com/logos/unl.png', 'https://www.unl.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Mississippi', 'Oxford, MS', 'Public', 'Medium', 0.88, 78, 10500, 'https://example.com/logos/olemiss.png', 'https://www.olemiss.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Oklahoma', 'Norman, OK', 'Public', 'Large', 0.81, 79, 11400, 'https://example.com/logos/oklahoma.png', 'https://www.ou.edu', NOW(), NOW()),
(gen_random_uuid(), 'Clemson University Health Sciences', 'Greenville, SC', 'Public', 'Small', 0.70, 80, 15000, 'https://example.com/logos/clemsonhs.png', 'https://hs.clemson.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Colorado Boulder (Engineering)', 'Boulder, CO', 'Public', 'Large', 0.80, 81, 12200, 'https://example.com/logos/cubouldereng.png', 'https://www.colorado.edu', NOW(), NOW()),
(gen_random_uuid(), 'San Diego State University', 'San Diego, CA', 'Public', 'Large', 0.34, 82, 7000, 'https://example.com/logos/sdsu.png', 'https://www.sdsu.edu', NOW(), NOW()),
(gen_random_uuid(), 'California State University, Long Beach', 'Long Beach, CA', 'Public', 'Large', 0.45, 83, 7800, 'https://example.com/logos/csulb.png', 'https://www.csulb.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of California, Riverside', 'Riverside, CA', 'Public', 'Large', 0.60, 84, 13700, 'https://example.com/logos/ucr.png', 'https://www.ucr.edu', NOW(), NOW()),
(gen_random_uuid(), 'Illinois Institute of Technology', 'Chicago, IL', 'Private', 'Small', 0.63, 85, 47900, 'https://example.com/logos/iit.png', 'https://www.iit.edu', NOW(), NOW()),
(gen_random_uuid(), 'Drexel University', 'Philadelphia, PA', 'Private', 'Medium', 0.74, 86, 56466, 'https://example.com/logos/drexel.png', 'https://www.drexel.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of San Francisco', 'San Francisco, CA', 'Private', 'Medium', 0.63, 87, 54490, 'https://example.com/logos/usf.png', 'https://www.usfca.edu', NOW(), NOW()),
(gen_random_uuid(), 'Stevens Institute of Technology', 'Hoboken, NJ', 'Private', 'Small', 0.49, 88, 54310, 'https://example.com/logos/stevens.png', 'https://www.stevens.edu', NOW(), NOW()),
(gen_random_uuid(), 'Oregon State University', 'Corvallis, OR', 'Public', 'Large', 0.82, 89, 12200, 'https://example.com/logos/osu.png', 'https://oregonstate.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Missouri', 'Columbia, MO', 'Public', 'Large', 0.89, 90, 12100, 'https://example.com/logos/missouri.png', 'https://www.missouri.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Alabama', 'Tuscaloosa, AL', 'Public', 'Large', 0.83, 91, 11700, 'https://example.com/logos/alabama.png', 'https://www.ua.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Arkansas', 'Fayetteville, AR', 'Public', 'Large', 0.77, 92, 10500, 'https://example.com/logos/arkansas.png', 'https://www.uark.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Louisville', 'Louisville, KY', 'Public', 'Large', 0.76, 93, 11600, 'https://example.com/logos/louisville.png', 'https://www.louisville.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Mississippi Medical Center', 'Jackson, MS', 'Public', 'Small', 0.85, 94, 14200, 'https://example.com/logos/umc.png', 'https://www.umc.edu', NOW(), NOW()),
(gen_random_uuid(), 'Tulane University School of Public Health', 'New Orleans, LA', 'Private', 'Small', 0.19, 95, 60000, 'https://example.com/logos/tulaneph.png', 'https://sph.tulane.edu', NOW(), NOW()),
(gen_random_uuid(), 'Stony Brook University', 'Stony Brook, NY', 'Public', 'Large', 0.44, 96, 10900, 'https://example.com/logos/sbu.png', 'https://www.stonybrook.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of Hawaii at Manoa', 'Honolulu, HI', 'Public', 'Medium', 0.70, 97, 11176, 'https://example.com/logos/hawaii.png', 'https://manoa.hawaii.edu', NOW(), NOW()),
(gen_random_uuid(), 'Montana State University', 'Bozeman, MT', 'Public', 'Medium', 0.88, 98, 7600, 'https://example.com/logos/msub.png', 'https://www.montana.edu', NOW(), NOW()),
(gen_random_uuid(), 'University of North Texas', 'Denton, TX', 'Public', 'Large', 0.91, 99, 9100, 'https://example.com/logos/unt.png', 'https://www.unt.edu', NOW(), NOW()),
(gen_random_uuid(), 'Binghamton University', 'Binghamton, NY', 'Public', 'Medium', 0.46, 100, 13800, 'https://example.com/logos/binghamton.png', 'https://www.binghamton.edu', NOW(), NOW());
-- 101. Texas A&M University
  (gen_random_uuid(), 'Texas A&M University', 'College Station, TX', 'Public', 'Large', 0.60, 101, 14200, 'https://example.com/logos/tamu.png', 'https://www.tamu.edu', NOW(), NOW()),
  -- 102. University of California, San Diego
  (gen_random_uuid(), 'University of California, San Diego', 'La Jolla, CA', 'Public', 'Large', 0.30, 102, 14400, 'https://example.com/logos/ucsd.png', 'https://www.ucsd.edu', NOW(), NOW()),
  -- 103. University of California, Merced
  (gen_random_uuid(), 'University of California, Merced', 'Merced, CA', 'Public', 'Small', 0.85, 103, 7300, 'https://example.com/logos/ucmerced.png', 'https://www.ucmerced.edu', NOW(), NOW()),
  -- 104. University of Texas at Dallas
  (gen_random_uuid(), 'University of Texas at Dallas', 'Richardson, TX', 'Public', 'Large', 0.69, 104, 14000, 'https://example.com/logos/utd.png', 'https://www.utdallas.edu', NOW(), NOW()),
  -- 105. University of Texas at San Antonio
  (gen_random_uuid(), 'University of Texas at San Antonio', 'San Antonio, TX', 'Public', 'Large', 0.68, 105, 10000, 'https://example.com/logos/utsa.png', 'https://www.utsa.edu', NOW(), NOW()),
  -- 106. University of Texas at El Paso
  (gen_random_uuid(), 'University of Texas at El Paso', 'El Paso, TX', 'Public', 'Large', 0.64, 106, 9000, 'https://example.com/logos/utep.png', 'https://www.utep.edu', NOW(), NOW()),
  -- 107. Texas Tech University
  (gen_random_uuid(), 'Texas Tech University', 'Lubbock, TX', 'Public', 'Large', 0.68, 107, 13000, 'https://example.com/logos/ttu.png', 'https://www.ttu.edu', NOW(), NOW()),
  -- 108. Texas Christian University
  (gen_random_uuid(), 'Texas Christian University', 'Fort Worth, TX', 'Private', 'Medium', 0.49, 108, 53500, 'https://example.com/logos/tcu.png', 'https://www.tcu.edu', NOW(), NOW()),
  -- 109. University of Houston
  (gen_random_uuid(), 'University of Houston', 'Houston, TX', 'Public', 'Large', 0.61, 109, 10800, 'https://example.com/logos/uhoh.png', 'https://www.uh.edu', NOW(), NOW()),
  -- 110. University of Virginia
  (gen_random_uuid(), 'University of Virginia', 'Charlottesville, VA', 'Public', 'Large', 0.25, 110, 17109, 'https://example.com/logos/uva.png', 'https://www.virginia.edu', NOW(), NOW()),
  -- 111. University of North Carolina at Charlotte
  (gen_random_uuid(), 'University of North Carolina at Charlotte', 'Charlotte, NC', 'Public', 'Large', 0.64, 111, 7200, 'https://example.com/logos/uncc.png', 'https://www.charlotte.edu', NOW(), NOW()),
  -- 112. North Carolina State University
  (gen_random_uuid(), 'North Carolina State University', 'Raleigh, NC', 'Public', 'Large', 0.48, 112, 9400, 'https://example.com/logos/ncsu.png', 'https://www.ncsu.edu', NOW(), NOW()),
  -- 113. University of South Carolina
  (gen_random_uuid(), 'University of South Carolina', 'Columbia, SC', 'Public', 'Large', 0.64, 113, 12150, 'https://example.com/logos/uscarolina.png', 'https://www.sc.edu', NOW(), NOW()),
  -- 114. Ohio State University
  (gen_random_uuid(), 'Ohio State University', 'Columbus, OH', 'Public', 'Large', 0.52, 114, 11200, 'https://example.com/logos/osu.png', 'https://www.osu.edu', NOW(), NOW()),
  -- 115. Penn State University
  (gen_random_uuid(), 'Penn State University', 'University Park, PA', 'Public', 'Large', 0.54, 115, 18750, 'https://example.com/logos/pennstate.png', 'https://www.psu.edu', NOW(), NOW()),
  -- 116. Rutgers University—New Brunswick
  (gen_random_uuid(), 'Rutgers University—New Brunswick', 'New Brunswick, NJ', 'Public', 'Large', 0.60, 116, 15500, 'https://example.com/logos/rutgers.png', 'https://www.rutgers.edu', NOW(), NOW()),
  -- 117. University of Central Florida
  (gen_random_uuid(), 'University of Central Florida', 'Orlando, FL', 'Public', 'Large', 0.43, 117, 6500, 'https://example.com/logos/ucf.png', 'https://www.ucf.edu', NOW(), NOW()),
  -- 118. Florida State University
  (gen_random_uuid(), 'Florida State University', 'Tallahassee, FL', 'Public', 'Large', 0.52, 118, 6240, 'https://example.com/logos/fsu.png', 'https://www.fsu.edu', NOW(), NOW()),
  -- 119. University of South Florida
  (gen_random_uuid(), 'University of South Florida', 'Tampa, FL', 'Public', 'Large', 0.57, 119, 6450, 'https://example.com/logos/usf.png', 'https://www.usf.edu', NOW(), NOW()),
  -- 120. Georgia Institute of Technology
  (gen_random_uuid(), 'Georgia Institute of Technology', 'Atlanta, GA', 'Public', 'Medium', 0.18, 120, 33400, 'https://example.com/logos/gatech.png', 'https://www.gatech.edu', NOW(), NOW()),
  -- 121. New York University
  (gen_random_uuid(), 'New York University', 'New York, NY', 'Private', 'Large', 0.20, 121, 56000, 'https://example.com/logos/nyu.png', 'https://www.nyu.edu', NOW(), NOW()),
  -- 122. Amherst College
  (gen_random_uuid(), 'Amherst College', 'Amherst, MA', 'Private', 'Small', 0.11, 122, 60000, 'https://example.com/logos/amherst.png', 'https://www.amherst.edu', NOW(), NOW()),
  -- 123. Smith College
  (gen_random_uuid(), 'Smith College', 'Northampton, MA', 'Private', 'Small', 0.56, 123, 55500, 'https://example.com/logos/smith.png', 'https://www.smith.edu', NOW(), NOW()),
  -- 124. Loyola Marymount University
  (gen_random_uuid(), 'Loyola Marymount University', 'Los Angeles, CA', 'Private', 'Medium', 0.37, 124, 57800, 'https://example.com/logos/lmu.png', 'https://www.lmu.edu', NOW(), NOW()),
  -- 125. Brigham Young University
  (gen_random_uuid(), 'Brigham Young University', 'Provo, UT', 'Private', 'Medium', 0.64, 125, 6100, 'https://example.com/logos/byu.png', 'https://www.byu.edu', NOW(), NOW()),
  -- 126. University of Denver
  (gen_random_uuid(), 'University of Denver', 'Denver, CO', 'Private', 'Medium', 0.64, 126, 48500, 'https://example.com/logos/denver.png', 'https://www.du.edu', NOW(), NOW()),
  -- 127. Santa Clara University
  (gen_random_uuid(), 'Santa Clara University', 'Santa Clara, CA', 'Private', 'Medium', 0.59, 127, 55800, 'https://example.com/logos/scu.png', 'https://www.scu.edu', NOW(), NOW()),
  -- 128. University of the Pacific
  (gen_random_uuid(), 'University of the Pacific', 'Stockton, CA', 'Private', 'Small', 0.50, 128, 51000, 'https://example.com/logos/pacific.png', 'https://www.pacific.edu', NOW(), NOW()),
  -- 129. San Jose State University
  (gen_random_uuid(), 'San Jose State University', 'San Jose, CA', 'Public', 'Large', 0.67, 129, 8000, 'https://example.com/logos/sjsu.png', 'https://www.sjsu.edu', NOW(), NOW()),
  -- 130. California Polytechnic State University
  (gen_random_uuid(), 'California Polytechnic State University', 'San Luis Obispo, CA', 'Public', 'Large', 0.48, 130, 10000, 'https://example.com/logos/calpoly.png', 'https://www.calpoly.edu', NOW(), NOW()),
  -- 131. California State University, East Bay
  (gen_random_uuid(), 'California State University, East Bay', 'Hayward, CA', 'Public', 'Medium', 0.60, 131, 6250, 'https://example.com/logos/csueb.png', 'https://www.csueastbay.edu', NOW(), NOW()),
  -- 132. California State University, Sacramento
  (gen_random_uuid(), 'California State University, Sacramento', 'Sacramento, CA', 'Public', 'Large', 0.87, 132, 7300, 'https://example.com/logos/csusac.png', 'https://www.csus.edu', NOW(), NOW()),
  -- 133. San Francisco State University
  (gen_random_uuid(), 'San Francisco State University', 'San Francisco, CA', 'Public', 'Large', 0.85, 133, 7000, 'https://example.com/logos/sfsu.png', 'https://www.sfsu.edu', NOW(), NOW()),
  -- 134. California State University, Fullerton
  (gen_random_uuid(), 'California State University, Fullerton', 'Fullerton, CA', 'Public', 'Large', 0.80, 134, 7200, 'https://example.com/logos/csuf.png', 'https://www.fullerton.edu', NOW(), NOW()),
  -- 135. California State University, Northridge
  (gen_random_uuid(), 'California State University, Northridge', 'Northridge, CA', 'Public', 'Large', 0.65, 135, 7000, 'https://example.com/logos/csun.png', 'https://www.csun.edu', NOW(), NOW());

  -- 136. University of Alabama at Birmingham
  (gen_random_uuid(), 'University of Alabama at Birmingham', 'Birmingham, AL', 'Public', 'Large', 0.57, 136, 11000, 'https://example.com/logos/uab.png', 'https://www.uab.edu', NOW(), NOW()),
  -- 137. Auburn University
  (gen_random_uuid(), 'Auburn University', 'Auburn, AL', 'Public', 'Large', 0.81, 137, 14000, 'https://example.com/logos/auburn.png', 'https://www.auburn.edu', NOW(), NOW()),
  -- 138. Mississippi State University
  (gen_random_uuid(), 'Mississippi State University', 'Starkville, MS', 'Public', 'Large', 0.89, 138, 9700, 'https://example.com/logos/msstate.png', 'https://www.msstate.edu', NOW(), NOW()),
  -- 139. New Mexico State University
  (gen_random_uuid(), 'New Mexico State University', 'Las Cruces, NM', 'Public', 'Large', 0.85, 139, 8200, 'https://example.com/logos/nmsu.png', 'https://www.nmsu.edu', NOW(), NOW()),
  -- 140. University of Central Arkansas
  (gen_random_uuid(), 'University of Central Arkansas', 'Conway, AR', 'Public', 'Medium', 0.76, 140, 9500, 'https://example.com/logos/uca.png', 'https://uca.edu', NOW(), NOW()),
  -- 141. University of Arkansas at Little Rock
  (gen_random_uuid(), 'University of Arkansas at Little Rock', 'Little Rock, AR', 'Public', 'Medium', 0.81, 141, 8300, 'https://example.com/logos/ualr.png', 'https://ualr.edu', NOW(), NOW()),
  -- 142. University of Alabama in Huntsville
  (gen_random_uuid(), 'University of Alabama in Huntsville', 'Huntsville, AL', 'Public', 'Medium', 0.89, 142, 11000, 'https://example.com/logos/uah.png', 'https://www.uah.edu', NOW(), NOW()),
  -- 143. University of Memphis
  (gen_random_uuid(), 'University of Memphis', 'Memphis, TN', 'Public', 'Large', 0.85, 143, 11000, 'https://example.com/logos/memphis.png', 'https://www.memphis.edu', NOW(), NOW()),
  -- 144. University of Tennessee at Martin
  (gen_random_uuid(), 'University of Tennessee at Martin', 'Martin, TN', 'Public', 'Medium', 0.81, 144, 9700, 'https://example.com/logos/utm.png', 'https://www.utm.edu', NOW(), NOW()),
  -- 145. University of Tennessee at Chattanooga
  (gen_random_uuid(), 'University of Tennessee at Chattanooga', 'Chattanooga, TN', 'Public', 'Medium', 0.77, 145, 9800, 'https://example.com/logos/utc.png', 'https://www.utc.edu', NOW(), NOW()),
  -- 146. University of North Dakota
  (gen_random_uuid(), 'University of North Dakota', 'Grand Forks, ND', 'Public', 'Medium', 0.88, 146, 10800, 'https://example.com/logos/und.png', 'https://und.edu', NOW(), NOW()),
  -- 147. North Dakota State University
  (gen_random_uuid(), 'North Dakota State University', 'Fargo, ND', 'Public', 'Medium', 0.83, 147, 9300, 'https://example.com/logos/ndsu.png', 'https://www.ndsu.edu', NOW(), NOW()),
  -- 148. South Dakota State University
  (gen_random_uuid(), 'South Dakota State University', 'Brookings, SD', 'Public', 'Large', 0.87, 148, 9000, 'https://example.com/logos/sdsu.png', 'https://www.sdstate.edu', NOW(), NOW()),
  -- 149. University of South Dakota
  (gen_random_uuid(), 'University of South Dakota', 'Vermillion, SD', 'Public', 'Medium', 0.83, 149, 9500, 'https://example.com/logos/usd.png', 'https://www.usd.edu', NOW(), NOW()),
  -- 150. University of Montana
  (gen_random_uuid(), 'University of Montana', 'Missoula, MT', 'Public', 'Medium', 0.80, 150, 8500, 'https://example.com/logos/montana.png', 'https://www.umt.edu', NOW(), NOW()),
  -- 151. Boise State University
  (gen_random_uuid(), 'Boise State University', 'Boise, ID', 'Public', 'Large', 0.82, 151, 8600, 'https://example.com/logos/boisestate.png', 'https://www.boisestate.edu', NOW(), NOW()),
  -- 152. University of Wyoming
  (gen_random_uuid(), 'University of Wyoming', 'Laramie, WY', 'Public', 'Medium', 0.92, 152, 10000, 'https://example.com/logos/wyoming.png', 'https://www.uwyo.edu', NOW(), NOW()),
  -- 153. University of Colorado Colorado Springs
  (gen_random_uuid(), 'University of Colorado Colorado Springs', 'Colorado Springs, CO', 'Public', 'Medium', 0.79, 153, 9250, 'https://example.com/logos/uccs.png', 'https://www.uccs.edu', NOW(), NOW()),
  -- 154. Colorado State University
  (gen_random_uuid(), 'Colorado State University', 'Fort Collins, CO', 'Public', 'Large', 0.72, 154, 10100, 'https://example.com/logos/colostate.png', 'https://www.colostate.edu', NOW(), NOW()),
  -- 155. University of New Mexico
  (gen_random_uuid(), 'University of New Mexico', 'Albuquerque, NM', 'Public', 'Large', 0.75, 155, 7800, 'https://example.com/logos/unm.png', 'https://www.unm.edu', NOW(), NOW()),
  -- 156. Utah State University
  (gen_random_uuid(), 'Utah State University', 'Logan, UT', 'Public', 'Medium', 0.80, 156, 9000, 'https://example.com/logos/utahstate.png', 'https://www.usu.edu', NOW(), NOW()),
  -- 157. University of Nevada, Reno
  (gen_random_uuid(), 'University of Nevada, Reno', 'Reno, NV', 'Public', 'Medium', 0.82, 157, 10000, 'https://example.com/logos/unr.png', 'https://www.unr.edu', NOW(), NOW()),
  -- 158. University of Nevada, Las Vegas
  (gen_random_uuid(), 'University of Nevada, Las Vegas', 'Las Vegas, NV', 'Public', 'Large', 0.83, 158, 9300, 'https://example.com/logos/unlv.png', 'https://www.unlv.edu', NOW(), NOW()),
  -- 159. University of Idaho
  (gen_random_uuid(), 'University of Idaho', 'Moscow, ID', 'Public', 'Medium', 0.92, 159, 7800, 'https://example.com/logos/idaho.png', 'https://www.uidaho.edu', NOW(), NOW()),
  -- 160. University of Missouri–Kansas City
  (gen_random_uuid(), 'University of Missouri–Kansas City', 'Kansas City, MO', 'Public', 'Medium', 0.87, 160, 11000, 'https://example.com/logos/umkc.png', 'https://www.umkc.edu', NOW(), NOW()),
  -- 161. University of Missouri–St. Louis
  (gen_random_uuid(), 'University of Missouri–St. Louis', 'St. Louis, MO', 'Public', 'Medium', 0.85, 161, 10000, 'https://example.com/logos/umsl.png', 'https://www.umsl.edu', NOW(), NOW()),
  -- 162. Southeast Missouri State University
  (gen_random_uuid(), 'Southeast Missouri State University', 'Cape Girardeau, MO', 'Public', 'Medium', 0.90, 162, 8100, 'https://example.com/logos/semo.png', 'https://www.semo.edu', NOW(), NOW()),
  -- 163. Missouri State University
  (gen_random_uuid(), 'Missouri State University', 'Springfield, MO', 'Public', 'Large', 0.80, 163, 9000, 'https://example.com/logos/mosstate.png', 'https://www.missouristate.edu', NOW(), NOW()),
  -- 164. University of Nebraska Omaha
  (gen_random_uuid(), 'University of Nebraska Omaha', 'Omaha, NE', 'Public', 'Large', 0.86, 164, 9600, 'https://example.com/logos/uno.png', 'https://www.unomaha.edu', NOW(), NOW()),
  -- 165. Creighton University
  (gen_random_uuid(), 'Creighton University', 'Omaha, NE', 'Private', 'Medium', 0.72, 165, 50000, 'https://example.com/logos/creighton.png', 'https://www.creighton.edu', NOW(), NOW()),
  -- 166. Marquette University
  (gen_random_uuid(), 'Marquette University', 'Milwaukee, WI', 'Private', 'Medium', 0.72, 166, 51000, 'https://example.com/logos/marquette.png', 'https://www.marquette.edu', NOW(), NOW()),
  -- 167. University of Wisconsin–Milwaukee
  (gen_random_uuid(), 'University of Wisconsin–Milwaukee', 'Milwaukee, WI', 'Public', 'Large', 0.54, 167, 9250, 'https://example.com/logos/uwm.png', 'https://www.uwm.edu', NOW(), NOW()),
  -- 168. University of Wisconsin–Green Bay
  (gen_random_uuid(), 'University of Wisconsin–Green Bay', 'Green Bay, WI', 'Public', 'Medium', 0.88, 168, 8700, 'https://example.com/logos/uwgb.png', 'https://www.uwgb.edu', NOW(), NOW()),
  -- 169. University of Wisconsin–Eau Claire
  (gen_random_uuid(), 'University of Wisconsin–Eau Claire', 'Eau Claire, WI', 'Public', 'Medium', 0.88, 169, 8800, 'https://example.com/logos/uweau.png', 'https://www.uwec.edu', NOW(), NOW()),
  -- 170. Northern Illinois University
  (gen_random_uuid(), 'Northern Illinois University', 'DeKalb, IL', 'Public', 'Large', 0.84, 170, 9000, 'https://example.com/logos/niu.png', 'https://www.niu.edu', NOW(), NOW()),
  -- 171. Illinois State University
  (gen_random_uuid(), 'Illinois State University', 'Normal, IL', 'Public', 'Large', 0.89, 171, 9200, 'https://example.com/logos/illinoisstate.png', 'https://illinoisstate.edu', NOW(), NOW()),
  -- 172. Loyola University Chicago
  (gen_random_uuid(), 'Loyola University Chicago', 'Chicago, IL', 'Private', 'Medium', 0.74, 172, 48000, 'https://example.com/logos/loyolachicago.png', 'https://www.luc.edu', NOW(), NOW()),
  -- 173. DePaul University
  (gen_random_uuid(), 'DePaul University', 'Chicago, IL', 'Private', 'Large', 0.70, 173, 46500, 'https://example.com/logos/depaul.png', 'https://www.depaul.edu', NOW(), NOW()),
  -- 174. University of Illinois Chicago
  (gen_random_uuid(), 'University of Illinois Chicago', 'Chicago, IL', 'Public', 'Large', 0.74, 174, 10400, 'https://example.com/logos/uic.png', 'https://www.uic.edu', NOW(), NOW()),
  -- 175. IUPUI
  (gen_random_uuid(), 'Indiana University–Purdue University Indianapolis', 'Indianapolis, IN', 'Public', 'Large', 0.85, 175, 9400, 'https://example.com/logos/iupui.png', 'https://www.iupui.edu', NOW(), NOW()),
  -- 176. Ball State University
  (gen_random_uuid(), 'Ball State University', 'Muncie, IN', 'Public', 'Large', 0.81, 176, 8900, 'https://example.com/logos/ballstate.png', 'https://www.bsu.edu', NOW(), NOW()),
  -- 177. Butler University
  (gen_random_uuid(), 'Butler University', 'Indianapolis, IN', 'Private', 'Medium', 0.78, 177, 50000, 'https://example.com/logos/butler.png', 'https://www.butler.edu', NOW(), NOW()),
  -- 178. Valparaiso University
  (gen_random_uuid(), 'Valparaiso University', 'Valparaiso, IN', 'Private', 'Small', 0.65, 178, 48500, 'https://example.com/logos/valpo.png', 'https://www.valpo.edu', NOW(), NOW()),
  -- 179. University of Dayton
  (gen_random_uuid(), 'University of Dayton', 'Dayton, OH', 'Private', 'Medium', 0.67, 179, 46000, 'https://example.com/logos/dayton.png', 'https://www.udayton.edu', NOW(), NOW()),
  -- 180. Xavier University
  (gen_random_uuid(), 'Xavier University', 'Cincinnati, OH', 'Private', 'Medium', 0.72, 180, 48000, 'https://example.com/logos/xavier.png', 'https://www.xavier.edu', NOW(), NOW()),
  -- 181. University of Cincinnati
  (gen_random_uuid(), 'University of Cincinnati', 'Cincinnati, OH', 'Public', 'Large', 0.78, 181, 10500, 'https://example.com/logos/cincinnati.png', 'https://www.uc.edu', NOW(), NOW()),
  -- 182. Miami University (Ohio)
  (gen_random_uuid(), 'Miami University', 'Oxford, OH', 'Public', 'Medium', 0.82, 182, 11200, 'https://example.com/logos/miamioh.png', 'https://miamioh.edu', NOW(), NOW()),
  -- 183. Ohio University
  (gen_random_uuid(), 'Ohio University', 'Athens, OH', 'Public', 'Large', 0.90, 183, 9400, 'https://example.com/logos/ohiou.png', 'https://www.ohio.edu', NOW(), NOW()),
  -- 184. Kent State University
  (gen_random_uuid(), 'Kent State University', 'Kent, OH', 'Public', 'Large', 0.88, 184, 9100, 'https://example.com/logos/kentstate.png', 'https://www.kent.edu', NOW(), NOW()),
  -- 185. Cleveland State University
  (gen_random_uuid(), 'Cleveland State University', 'Cleveland, OH', 'Public', 'Medium', 0.80, 185, 9000, 'https://example.com/logos/clevelandstate.png', 'https://www.csuohio.edu', NOW(), NOW());

  -- 186. West Virginia University
  (gen_random_uuid(), 'West Virginia University', 'Morgantown, WV', 'Public', 'Large', 0.76, 186, 14200, 'https://example.com/logos/wvu.png', 'https://www.wvu.edu', NOW(), NOW()),
  -- 187. Marshall University
  (gen_random_uuid(), 'Marshall University', 'Huntington, WV', 'Public', 'Medium', 0.82, 187, 9000, 'https://example.com/logos/marshall.png', 'https://www.marshall.edu', NOW(), NOW()),
  -- 188. James Madison University
  (gen_random_uuid(), 'James Madison University', 'Harrisonburg, VA', 'Public', 'Large', 0.77, 188, 10000, 'https://example.com/logos/jmu.png', 'https://www.jmu.edu', NOW(), NOW()),
  -- 189. Old Dominion University
  (gen_random_uuid(), 'Old Dominion University', 'Norfolk, VA', 'Public', 'Large', 0.82, 189, 9300, 'https://example.com/logos/odu.png', 'https://www.odu.edu', NOW(), NOW()),
  -- 190. University of Massachusetts Boston
  (gen_random_uuid(), 'University of Massachusetts Boston', 'Boston, MA', 'Public', 'Large', 0.58, 190, 15000, 'https://example.com/logos/umassboston.png', 'https://www.umb.edu', NOW(), NOW()),
  -- 191. University of Massachusetts Lowell
  (gen_random_uuid(), 'University of Massachusetts Lowell', 'Lowell, MA', 'Public', 'Large', 0.63, 191, 14000, 'https://example.com/logos/umasslowell.png', 'https://www.uml.edu', NOW(), NOW()),
  -- 192. University of Massachusetts Dartmouth
  (gen_random_uuid(), 'University of Massachusetts Dartmouth', 'Dartmouth, MA', 'Public', 'Medium', 0.68, 192, 13000, 'https://example.com/logos/umassdartmouth.png', 'https://www.umassd.edu', NOW(), NOW()),
  -- 193. Northern Arizona University
  (gen_random_uuid(), 'Northern Arizona University', 'Flagstaff, AZ', 'Public', 'Medium', 0.81, 193, 8600, 'https://example.com/logos/nau.png', 'https://www.nau.edu', NOW(), NOW()),
  -- 194. Grand Canyon University
  (gen_random_uuid(), 'Grand Canyon University', 'Phoenix, AZ', 'Private', 'Large', 0.86, 194, 30000, 'https://example.com/logos/gcu.png', 'https://www.gcu.edu', NOW(), NOW()),
  -- 195. Arizona State University
  (gen_random_uuid(), 'Arizona State University', 'Tempe, AZ', 'Public', 'Large', 0.85, 195, 11200, 'https://example.com/logos/asu.png', 'https://www.asu.edu', NOW(), NOW()),
  -- 196. University of New Orleans
  (gen_random_uuid(), 'University of New Orleans', 'New Orleans, LA', 'Public', 'Medium', 0.65, 196, 10000, 'https://example.com/logos/uno.png', 'https://www.uno.edu', NOW(), NOW()),
  -- 197. Loyola University New Orleans
  (gen_random_uuid(), 'Loyola University New Orleans', 'New Orleans, LA', 'Private', 'Medium', 0.70, 197, 46000, 'https://example.com/logos/loyno.png', 'https://www.loyno.edu', NOW(), NOW()),
  -- 198. University of Louisiana at Lafayette
  (gen_random_uuid(), 'University of Louisiana at Lafayette', 'Lafayette, LA', 'Public', 'Medium', 0.75, 198, 12000, 'https://example.com/logos/ull.png', 'https://www.louisiana.edu', NOW(), NOW()),
  -- 199. University of Louisiana at Monroe
  (gen_random_uuid(), 'University of Louisiana at Monroe', 'Monroe, LA', 'Public', 'Medium', 0.76, 199, 10500, 'https://example.com/logos/ulm.png', 'https://www.ulm.edu', NOW(), NOW()),
  -- 200. Florida International University
  (gen_random_uuid(), 'Florida International University', 'Miami, FL', 'Public', 'Large', 0.58, 200, 6000, 'https://example.com/logos/fiu.png', 'https://www.fiu.edu', NOW(), NOW()),
  -- 201. University of North Florida
  (gen_random_uuid(), 'University of North Florida', 'Jacksonville, FL', 'Public', 'Large', 0.78, 201, 7500, 'https://example.com/logos/unf.png', 'https://www.unf.edu', NOW(), NOW()),
  -- 202. University of West Florida
  (gen_random_uuid(), 'University of West Florida', 'Pensacola, FL', 'Public', 'Medium', 0.82, 202, 8000, 'https://example.com/logos/uwf.png', 'https://www.uwf.edu', NOW(), NOW()),
  -- 203. Florida Atlantic University
  (gen_random_uuid(), 'Florida Atlantic University', 'Boca Raton, FL', 'Public', 'Large', 0.60, 203, 6500, 'https://example.com/logos/fau.png', 'https://www.fau.edu', NOW(), NOW()),
  -- 204. Florida Gulf Coast University
  (gen_random_uuid(), 'Florida Gulf Coast University', 'Fort Myers, FL', 'Public', 'Medium', 0.75, 204, 7000, 'https://example.com/logos/fgcu.png', 'https://www.fgcu.edu', NOW(), NOW()),
  -- 205. Georgia Southern University
  (gen_random_uuid(), 'Georgia Southern University', 'Statesboro, GA', 'Public', 'Large', 0.80, 205, 11000, 'https://example.com/logos/georgiasouthern.png', 'https://www.georgiasouthern.edu', NOW(), NOW()),
  -- 206. Kennesaw State University
  (gen_random_uuid(), 'Kennesaw State University', 'Kennesaw, GA', 'Public', 'Large', 0.78, 206, 9000, 'https://example.com/logos/kennesaw.png', 'https://www.kennesaw.edu', NOW(), NOW()),
  -- 207. Mercer University
  (gen_random_uuid(), 'Mercer University', 'Macon, GA', 'Private', 'Medium', 0.67, 207, 41000, 'https://example.com/logos/mercer.png', 'https://www.mercer.edu', NOW(), NOW()),
  -- 208. Valdosta State University
  (gen_random_uuid(), 'Valdosta State University', 'Valdosta, GA', 'Public', 'Large', 0.78, 208, 8000, 'https://example.com/logos/vsu.png', 'https://www.valdosta.edu', NOW(), NOW()),
  -- 209. University of Alaska Fairbanks
  (gen_random_uuid(), 'University of Alaska Fairbanks', 'Fairbanks, AK', 'Public', 'Medium', 0.70, 209, 6500, 'https://example.com/logos/uaf.png', 'https://www.uaf.edu', NOW(), NOW()),
  -- 210. University of Alaska Anchorage
  (gen_random_uuid(), 'University of Alaska Anchorage', 'Anchorage, AK', 'Public', 'Medium', 0.73, 210, 7800, 'https://example.com/logos/uaa.png', 'https://www.uaa.alaska.edu', NOW(), NOW()),
  -- 211. University of Hawaii at Hilo
  (gen_random_uuid(), 'University of Hawaii at Hilo', 'Hilo, HI', 'Public', 'Medium', 0.80, 211, 10000, 'https://example.com/logos/uhh.png', 'https://hilo.hawaii.edu', NOW(), NOW()),
  -- 212. Chaminade University of Honolulu
  (gen_random_uuid(), 'Chaminade University of Honolulu', 'Honolulu, HI', 'Private', 'Small', 0.92, 212, 38000, 'https://example.com/logos/chaminade.png', 'https://www.chaminade.edu', NOW(), NOW()),
  -- 213. Pacific Lutheran University
  (gen_random_uuid(), 'Pacific Lutheran University', 'Tacoma, WA', 'Private', 'Medium', 0.73, 213, 43000, 'https://example.com/logos/plu.png', 'https://www.plu.edu', NOW(), NOW()),
  -- 214. Seattle University
  (gen_random_uuid(), 'Seattle University', 'Seattle, WA', 'Private', 'Medium', 0.70, 214, 48000, 'https://example.com/logos/seattleu.png', 'https://www.seattleu.edu', NOW(), NOW()),
  -- 215. Gonzaga University
  (gen_random_uuid(), 'Gonzaga University', 'Spokane, WA', 'Private', 'Medium', 0.75, 215, 46000, 'https://example.com/logos/gonzaga.png', 'https://www.gonzaga.edu', NOW(), NOW()),
  -- 216. Eastern Washington University
  (gen_random_uuid(), 'Eastern Washington University', 'Cheney, WA', 'Public', 'Medium', 0.86, 216, 9000, 'https://example.com/logos/ewu.png', 'https://www.ewu.edu', NOW(), NOW()),
  -- 217. Western Washington University
  (gen_random_uuid(), 'Western Washington University', 'Bellingham, WA', 'Public', 'Medium', 0.81, 217, 8500, 'https://example.com/logos/wwu.png', 'https://www.wwu.edu', NOW(), NOW()),
  -- 218. Central Washington University
  (gen_random_uuid(), 'Central Washington University', 'Ellensburg, WA', 'Public', 'Medium', 0.82, 218, 7600, 'https://example.com/logos/cwu.png', 'https://www.cwu.edu', NOW(), NOW()),
  -- 219. Washington State University
  (gen_random_uuid(), 'Washington State University', 'Pullman, WA', 'Public', 'Large', 0.77, 219, 10000, 'https://example.com/logos/wsu.png', 'https://www.wsu.edu', NOW(), NOW()),
  -- 220. University of Portland
  (gen_random_uuid(), 'University of Portland', 'Portland, OR', 'Private', 'Medium', 0.74, 220, 50000, 'https://example.com/logos/portland.png', 'https://www.up.edu', NOW(), NOW()),
  -- 221. Portland State University
  (gen_random_uuid(), 'Portland State University', 'Portland, OR', 'Public', 'Large', 0.76, 221, 8700, 'https://example.com/logos/psu.png', 'https://www.pdx.edu', NOW(), NOW()),
  -- 222. Oregon Institute of Technology
  (gen_random_uuid(), 'Oregon Institute of Technology', 'Klamath Falls, OR', 'Public', 'Medium', 0.83, 222, 8800, 'https://example.com/logos/oit.png', 'https://www.oit.edu', NOW(), NOW()),
  -- 223. Eastern Oregon University
  (gen_random_uuid(), 'Eastern Oregon University', 'La Grande, OR', 'Public', 'Small', 0.93, 223, 9500, 'https://example.com/logos/eou.png', 'https://www.eou.edu', NOW(), NOW()),
  -- 224. Southern Oregon University
  (gen_random_uuid(), 'Southern Oregon University', 'Ashland, OR', 'Public', 'Medium', 0.86, 224, 9000, 'https://example.com/logos/sou.png', 'https://www.sou.edu', NOW(), NOW()),
  -- 225. Oregon Health & Science University
  (gen_random_uuid(), 'Oregon Health & Science University', 'Portland, OR', 'Public', 'Medium', 0.85, 225, 46000, 'https://example.com/logos/oshu.png', 'https://www.ohsu.edu', NOW(), NOW());
 -- 226. Louisiana State University
  (gen_random_uuid(), 'Louisiana State University', 'Baton Rouge, LA', 'Public', 'Large', 0.10, 226, 12000, 'https://example.com/logos/lsu.png', 'https://www.lsu.edu', NOW(), NOW()),
  -- 227. Purdue University
  (gen_random_uuid(), 'Purdue University', 'West Lafayette, IN', 'Public', 'Large', 0.57, 227, 9200, 'https://example.com/logos/purdue.png', 'https://www.purdue.edu', NOW(), NOW()),
  -- 228. University of Iowa
  (gen_random_uuid(), 'University of Iowa', 'Iowa City, IA', 'Public', 'Large', 0.83, 228, 9800, 'https://example.com/logos/iowa.png', 'https://www.uiowa.edu', NOW(), NOW()),
  -- 229. University of Kansas
  (gen_random_uuid(), 'University of Kansas', 'Lawrence, KS', 'Public', 'Large', 0.93, 229, 11000, 'https://example.com/logos/ku.png', 'https://www.ku.edu', NOW(), NOW()),
  -- 230. Kansas State University
  (gen_random_uuid(), 'Kansas State University', 'Manhattan, KS', 'Public', 'Large', 0.95, 230, 11500, 'https://example.com/logos/kstate.png', 'https://www.k-state.edu', NOW(), NOW()),
  -- 231. Iowa State University
  (gen_random_uuid(), 'Iowa State University', 'Ames, IA', 'Public', 'Large', 0.88, 231, 9400, 'https://example.com/logos/iastate.png', 'https://www.iastate.edu', NOW(), NOW()),
  -- 232. Oklahoma State University
  (gen_random_uuid(), 'Oklahoma State University', 'Stillwater, OK', 'Public', 'Large', 0.70, 232, 10000, 'https://example.com/logos/osu.png', 'https://go.okstate.edu', NOW(), NOW()),
  -- 233. Syracuse University
  (gen_random_uuid(), 'Syracuse University', 'Syracuse, NY', 'Private', 'Large', 0.55, 233, 55200, 'https://example.com/logos/syracuse.png', 'https://www.syracuse.edu', NOW(), NOW()),
  -- 234. St. John’s University
  (gen_random_uuid(), 'St. John’s University', 'Queens, NY', 'Private', 'Large', 0.49, 234, 51000, 'https://example.com/logos/stjohns.png', 'https://www.stjohns.edu', NOW(), NOW()),
  -- 235. University of Utah
  (gen_random_uuid(), 'University of Utah', 'Salt Lake City, UT', 'Public', 'Large', 0.62, 235, 9500, 'https://example.com/logos/utah.png', 'https://www.utah.edu', NOW(), NOW()),
  -- 236. California State University, Fresno
  (gen_random_uuid(), 'California State University, Fresno', 'Fresno, CA', 'Public', 'Large', 0.77, 236, 6500, 'https://example.com/logos/fresno.png', 'https://www.csufresno.edu', NOW(), NOW());
-- 237. United States Military Academy (Army)
  (gen_random_uuid(), 'United States Military Academy', 'West Point, NY', 'Public', 'Small', 0.11, 237, 0, 'https://example.com/logos/army.png', 'https://www.westpoint.edu', NOW(), NOW()),
  -- 238. United States Naval Academy (Navy)
  (gen_random_uuid(), 'United States Naval Academy', 'Annapolis, MD', 'Public', 'Small', 0.08, 238, 0, 'https://example.com/logos/navy.png', 'https://www.usna.edu', NOW(), NOW()),
  -- 239. United States Air Force Academy
  (gen_random_uuid(), 'United States Air Force Academy', 'Colorado Springs, CO', 'Public', 'Small', 0.21, 239, 0, 'https://example.com/logos/airforce.png', 'https://www.usafa.edu', NOW(), NOW());

   -- 240. Providence College
  (gen_random_uuid(), 'Providence College', 'Providence, RI', 'Private', 'Medium', 0.57, 240, 56500, 'https://example.com/logos/providence.png', 'https://www.providence.edu', NOW(), NOW()),
  -- 241. Seton Hall University
  (gen_random_uuid(), 'Seton Hall University', 'South Orange, NJ', 'Private', 'Medium', 0.71, 241, 51000, 'https://example.com/logos/setonhall.png', 'https://www.shu.edu', NOW(), NOW()),
  -- 242. Wichita State University
  (gen_random_uuid(), 'Wichita State University', 'Wichita, KS', 'Public', 'Large', 0.69, 242, 9000, 'https://example.com/logos/wichita.png', 'https://www.wichita.edu', NOW(), NOW()),
  -- 243. Virginia Commonwealth University
  (gen_random_uuid(), 'Virginia Commonwealth University', 'Richmond, VA', 'Public', 'Large', 0.95, 243, 13900, 'https://example.com/logos/vcu.png', 'https://www.vcu.edu', NOW(), NOW()),
  -- 244. George Mason University
  (gen_random_uuid(), 'George Mason University', 'Fairfax, VA', 'Public', 'Large', 0.82, 244, 12200, 'https://example.com/logos/georgemason.png', 'https://www2.gmu.edu', NOW(), NOW()),
  -- 245. Temple University
  (gen_random_uuid(), 'Temple University', 'Philadelphia, PA', 'Public', 'Large', 0.64, 245, 17000, 'https://example.com/logos/temple.png', 'https://www.temple.edu', NOW(), NOW()),
  -- 246. Towson University
  (gen_random_uuid(), 'Towson University', 'Towson, MD', 'Public', 'Large', 0.80, 246, 10000, 'https://example.com/logos/towson.png', 'https://www.towson.edu', NOW(), NOW()),
  -- 247. University at Buffalo
  (gen_random_uuid(), 'University at Buffalo', 'Buffalo, NY', 'Public', 'Large', 0.62, 247, 10000, 'https://example.com/logos/buffalo.png', 'https://www.buffalo.edu', NOW(), NOW()),
  -- 248. Texas State University
  (gen_random_uuid(), 'Texas State University', 'San Marcos, TX', 'Public', 'Large', 0.68, 248, 8500, 'https://example.com/logos/txstate.png', 'https://www.txstate.edu', NOW(), NOW()),
  -- 249. Georgia State University
  (gen_random_uuid(), 'Georgia State University', 'Atlanta, GA', 'Public', 'Large', 0.64, 249, 10500, 'https://example.com/logos/georgiastate.png', 'https://www.gsu.edu', NOW(), NOW()),
  -- 250. American University
  (gen_random_uuid(), 'American University', 'Washington, DC', 'Private', 'Medium', 0.31, 250, 57000, 'https://example.com/logos/american.png', 'https://www.american.edu', NOW(), NOW()),
  -- 251. University of Vermont
  (gen_random_uuid(), 'University of Vermont', 'Burlington, VT', 'Public', 'Medium', 0.70, 251, 18200, 'https://example.com/logos/uvm.png', 'https://www.uvm.edu', NOW(), NOW()),
  -- 252. University of New Hampshire
  (gen_random_uuid(), 'University of New Hampshire', 'Durham, NH', 'Public', 'Large', 0.86, 252, 22000, 'https://example.com/logos/unh.png', 'https://www.unh.edu', NOW(), NOW()),
  -- 253. University of Maine
  (gen_random_uuid(), 'University of Maine', 'Orono, ME', 'Public', 'Large', 0.91, 253, 11500, 'https://example.com/logos/umaine.png', 'https://www.umaine.edu', NOW(), NOW()),
  -- 254. University of Rhode Island
  (gen_random_uuid(), 'University of Rhode Island', 'Kingston, RI', 'Public', 'Medium', 0.86, 254, 16000, 'https://example.com/logos/uri.png', 'https://www.uri.edu', NOW(), NOW()),
  -- 255. Belmont University
  (gen_random_uuid(), 'Belmont University', 'Nashville, TN', 'Private', 'Medium', 0.86, 255, 42800, 'https://example.com/logos/belmont.png', 'https://www.belmont.edu', NOW(), NOW()),
  -- 256. Oral Roberts University
  (gen_random_uuid(), 'Oral Roberts University', 'Tulsa, OK', 'Private', 'Medium', 0.85, 256, 42500, 'https://example.com/logos/oralroberts.png', 'https://oru.edu', NOW(), NOW()),
  -- 257. Liberty University
  (gen_random_uuid(), 'Liberty University', 'Lynchburg, VA', 'Private', 'Large', 0.50, 257, 41500, 'https://example.com/logos/liberty.png', 'https://www.liberty.edu', NOW(), NOW()),
  -- 258. Norfolk State University
  (gen_random_uuid(), 'Norfolk State University', 'Norfolk, VA', 'Public', 'Medium', 0.70, 258, 6000, 'https://example.com/logos/nsu.png', 'https://www.nsu.edu', NOW(), NOW()),
  -- 259. Howard University
  (gen_random_uuid(), 'Howard University', 'Washington, DC', 'Private', 'Medium', 0.31, 259, 26500, 'https://example.com/logos/howard.png', 'https://www.howard.edu', NOW(), NOW()),
  -- 260. Bucknell University
  (gen_random_uuid(), 'Bucknell University', 'Lewisburg, PA', 'Private', 'Small', 0.33, 260, 60000, 'https://example.com/logos/bucknell.png', 'https://www.bucknell.edu', NOW(), NOW()),
  -- 261. Colgate University
  (gen_random_uuid(), 'Colgate University', 'Hamilton, NY', 'Private', 'Small', 0.28, 261, 55000, 'https://example.com/logos/colgate.png', 'https://www.colgate.edu', NOW(), NOW()),
  -- 262. Davidson College
  (gen_random_uuid(), 'Davidson College', 'Davidson, NC', 'Private', 'Small', 0.17, 262, 57000, 'https://example.com/logos/davidson.png', 'https://www.davidson.edu', NOW(), NOW()),
  -- 263. Furman University
  (gen_random_uuid(), 'Furman University', 'Greenville, SC', 'Private', 'Small', 0.71, 263, 49200, 'https://example.com/logos/furman.png', 'https://www.furman.edu', NOW(), NOW()),
  -- 264. Elon University
  (gen_random_uuid(), 'Elon University', 'Elon, NC', 'Private', 'Small', 0.78, 264, 51500, 'https://example.com/logos/elon.png', 'https://www.elon.edu', NOW(), NOW()),
  -- 265. Rollins College
  (gen_random_uuid(), 'Rollins College', 'Winter Park, FL', 'Private', 'Small', 0.70, 265, 53000, 'https://example.com/logos/rollins.png', 'https://www.rollins.edu', NOW(), NOW()),
  -- 266. University of Richmond
  (gen_random_uuid(), 'University of Richmond', 'Richmond, VA', 'Private', 'Small', 0.27, 266, 56500, 'https://example.com/logos/richmond.png', 'https://www.richmond.edu', NOW(), NOW()),
  -- 267. University of North Carolina at Wilmington
  (gen_random_uuid(), 'University of North Carolina at Wilmington', 'Wilmington, NC', 'Public', 'Medium', 0.82, 267, 8000, 'https://example.com/logos/uncw.png', 'https://www.uncw.edu', NOW(), NOW()),
  -- 268. University of North Carolina at Greensboro
  (gen_random_uuid(), 'University of North Carolina at Greensboro', 'Greensboro, NC', 'Public', 'Large', 0.79, 268, 11500, 'https://example.com/logos/uncg.png', 'https://www.uncg.edu', NOW(), NOW()),
  -- 269. East Carolina University
  (gen_random_uuid(), 'East Carolina University', 'Greenville, NC', 'Public', 'Large', 0.85, 269, 10000, 'https://example.com/logos/ecu.png', 'https://www.ecu.edu', NOW(), NOW()),
  -- 270. Appalachian State University
  (gen_random_uuid(), 'Appalachian State University', 'Boone, NC', 'Public', 'Large', 0.81, 270, 8500, 'https://example.com/logos/appstate.png', 'https://www.appstate.edu', NOW(), NOW()),
  -- 271. University of South Alabama
  (gen_random_uuid(), 'University of South Alabama', 'Mobile, AL', 'Public', 'Medium', 0.78, 271, 9200, 'https://example.com/logos/usa.png', 'https://www.southalabama.edu', NOW(), NOW()),
  -- 272. Jacksonville State University
  (gen_random_uuid(), 'Jacksonville State University', 'Jacksonville, AL', 'Public', 'Medium', 0.95, 272, 7000, 'https://example.com/logos/jsu.png', 'https://www.jsu.edu', NOW(), NOW()),
  -- 273. Troy University
  (gen_random_uuid(), 'Troy University', 'Troy, AL', 'Public', 'Medium', 0.85, 273, 8000, 'https://example.com/logos/troy.png', 'https://www.troy.edu', NOW(), NOW()),
  -- 274. University of West Alabama
  (gen_random_uuid(), 'University of West Alabama', 'Livingston, AL', 'Public', 'Small', 0.95, 274, 7500, 'https://example.com/logos/uwa.png', 'https://www.uwa.edu', NOW(), NOW()),
  -- 275. University of Central Missouri
  (gen_random_uuid(), 'University of Central Missouri', 'Warrensburg, MO', 'Public', 'Medium', 0.90, 275, 8500, 'https://example.com/logos/ucmo.png', 'https://www.ucmo.edu', NOW(), NOW()),
  -- 276. East Tennessee State University
  (gen_random_uuid(), 'East Tennessee State University', 'Johnson City, TN', 'Public', 'Medium', 0.80, 276, 8000, 'https://example.com/logos/etsu.png', 'https://www.etsu.edu', NOW(), NOW()),
  -- 277. Middle Tennessee State University
  (gen_random_uuid(), 'Middle Tennessee State University', 'Murfreesboro, TN', 'Public', 'Large', 0.70, 277, 9500, 'https://example.com/logos/mtsu.png', 'https://www.mtsu.edu', NOW(), NOW()),
  -- 278. Tennessee Technological University
  (gen_random_uuid(), 'Tennessee Technological University', 'Cookeville, TN', 'Public', 'Medium', 0.93, 278, 9000, 'https://example.com/logos/tntech.png', 'https://www.tntech.edu', NOW(), NOW()),
  -- 279. Norfolk State University
  (gen_random_uuid(), 'Norfolk State University', 'Norfolk, VA', 'Public', 'Medium', 0.70, 279, 6000, 'https://example.com/logos/nsu.png', 'https://www.nsu.edu', NOW(), NOW());
