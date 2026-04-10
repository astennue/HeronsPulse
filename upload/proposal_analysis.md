+-----------------------------------------------------------------------+
| **Research Proposal 3**                                               |
+-----------------------------------------------------------------------+
| **A. BASIC INFORMATION**                                              |
+-----------------------------------------------------------------------+
| **Project Title:** Development of HeronPulse: Academic Workload       |
| Forecasting and Prediction Risk Monitoring System for CCIS Students   |
| Using Gradient Boosting Regression                                    |
+-----------------------------------------------------------------------+
| **Keywords:** Academic Load Index, Student Workload Prediction,       |
| Gradient Boosting Regression, Multi-Horizon Forecasting, Educational  |
| Data Mining, Burnout Risk Monitoring, Web-Based Decision Support      |
| System, Cognitive Load Theory, Academic Risk Classification           |
+-----------------------------------------------------------------------+
| **Proponents**: John Benedick Hermoso, Maricar Orense, Reiner Nuevas, |
| Michaella Nil Santiago                                                |
+-----------------------------------------------------------------------+
| **B. TECHNICAL DESCRIPTION**                                          |
+-----------------------------------------------------------------------+
| **Project Context**                                                   |
|                                                                       |
| Higher education institutions worldwide are increasingly confronted   |
| with the complex challenge of managing academic workload distribution |
| while simultaneously maintaining student performance and well-being.  |
| In computing and information systems programs, this challenge is      |
| particularly pronounced --- students are regularly subjected to       |
| multiple overlapping deadlines, intensive programming projects,       |
| research requirements, extracurricular obligations, and               |
| performance-based assessments within the same academic period. The    |
| compounding nature of these demands leads to widespread concerns      |
| regarding cognitive overload, academic fatigue, and reduced learning  |
| productivity. As higher education institutions continue integrating   |
| digital learning environments and expanding their academic offerings, |
| the need for intelligent, data-driven systems capable of monitoring   |
| and forecasting academic workload trends has become increasingly      |
| urgent.                                                               |
|                                                                       |
| Within this broader educational technology landscape, academic        |
| workload modeling has emerged as a critical and growing research area |
| in Educational Data Mining (EDM). Existing studies in this field have |
| primarily concentrated on predicting student grades, dropout risks,   |
| and engagement levels. However, limited research has addressed        |
| structured academic load forecasting using quantifiable operational   |
| workload indicators --- such as task density, deadline clustering,    |
| assessment frequency, extracurricular load, part-time work            |
| interference, and research intensity --- as composite inputs to a     |
| predictive machine learning model. More critically, there is a        |
| notable absence of localized systems designed specifically for        |
| computing students in Philippine higher education institutions, whose |
| academic structure is predominantly project-heavy, deadline-driven,   |
| and research-intensive. This gap presents a compelling opportunity to |
| design a system that translates these measurable academic factors     |
| into a structured, quantifiable Academic Load Index (ALI) and         |
| forecasts future workload risk exposure using machine learning.       |
|                                                                       |
| This study addresses the combined problem of: (1) the absence of any  |
| existing system that forecasts or monitors student academic workload  |
| at the College of Computing and Information Sciences (CCIS) of the    |
| University of Makati (UMak); (2) the lack of early warning mechanisms |
| for both students and faculty advisers when academic demands are      |
| projected to exceed manageable thresholds; and (3) the purely         |
| reactive nature of current workload monitoring, which relies on       |
| subjective perceptions rather than predictive, data-driven analytics. |
| No system currently exists at CCIS that proactively alerts students   |
| and faculty when cumulative workload exposure is approaching critical |
| levels across multiple dimensions simultaneously.                     |
|                                                                       |
| Evidence from academic workload studies validates the urgency and     |
| significance of this combined problem. In the Philippine context,     |
| Geronimo et al. (2023) confirmed through machine learning analysis of |
| Filipino college students that excessive academic workload,           |
| examination difficulty, and teacher expectations are the three        |
| primary drivers of perceived academic stress --- directly             |
| substantiating the workload factors adopted in HeronPulse\'s ALI      |
| framework. Tapio (2025), in a study conducted at a private HEI in     |
| Misamis Occidental with 291 college student respondents, further      |
| demonstrated that Filipino students exhibit clinically significant    |
| burnout indicators traceable to academic overload patterns ---        |
| confirming that the consequences of unmonitored workload accumulation |
| are measurable and predictable. At the international level, studies   |
| by Wang and Luo (2024) and multiple authors (2025) in Scientific      |
| Reports confirm that Gradient Boosting Regression achieves superior   |
| predictive accuracy for academic outcome forecasting from structured  |
| institutional data --- establishing the empirical basis for GBR as    |
| HeronPulse\'s primary algorithm.                                      |
|                                                                       |
| The root causes of this problem at CCIS UMak stem from overlapping    |
| course structures with unsynchronized assessment schedules, the       |
| absence of a centralized deadline monitoring system, decentralized    |
| academic planning across multiple subjects and faculty, and the       |
| complete lack of operational workload analytics infrastructure. The   |
| cumulative effects include student mental fatigue, reduced academic   |
| efficiency, rushed and low-quality submissions, increased burnout     |
| risk, and potential long-term academic disengagement --- particularly |
| during peak assessment periods such as midterms and finals.           |
| Addressing this systemic gap requires a structured Academic Load      |
| Index supported by Gradient Boosting Regression to enable proactive   |
| academic management, providing CCIS students and faculty advisers     |
| with actionable, data-validated workload insights before critical     |
| thresholds are breached rather than after harm has already occurred.  |
|                                                                       |
| **Theoretical Framework**                                             |
|                                                                       |
| HeronPulse is grounded in three theoretical foundations that          |
| collectively justify its design architecture, factor selection, and   |
| machine learning approach:                                            |
|                                                                       |
| **1. Cognitive Load Theory**                                          |
|                                                                       |
| Cognitive Load Theory posits that human working memory has a finite   |
| processing capacity, and that exceeding this capacity through         |
| simultaneous academic demands leads to cognitive overload, diminished |
| learning efficiency, and reduced performance. Applied to HeronPulse,  |
| this theory directly justifies the multi-factor construction of the   |
| Academic Load Index (ALI) --- specifically, the premise that task     |
| density, assessment clustering, deadline pressure, research           |
| obligations, extracurricular load, and part-time work interference    |
| simultaneously impose intrinsic and extraneous cognitive loads that   |
| are individually quantifiable and collectively forecastable. Kalita   |
| et al. (2025), in a comprehensive 10-year EDM review published in     |
| Discover Computing, confirm that workload-driven cognitive overload   |
| remains one of the most empirically validated predictors of student   |
| underperformance, reinforcing HeronPulse\'s foundational design       |
| premise. HeronPulse operationalizes Cognitive Load Theory by          |
| converting these six workload dimensions into a measurable 0--100 ALI |
| score that reflects the cumulative intensity of academic demands on a |
| student\'s cognitive capacity at any given time.                      |
|                                                                       |
| **2. Academic Workload and Burnout as Measurable Constructs**         |
|                                                                       |
| Contemporary research consistently validates that academic workload   |
| is a quantifiable, multi-dimensional construct with directly          |
| measurable impacts on student well-being and academic outcomes. Tapio |
| (2025) confirmed that academic overload indicators are the strongest  |
| predictors of burnout status among Filipino college students,         |
| directly supporting HeronPulse\'s multi-factor ALI approach and its   |
| four-level risk classification system (Low, Moderate, High,           |
| Critical). Lim et al. (2023) further documented that workload-related |
| exhaustion among Filipino college students follows identifiable,      |
| forecastable patterns --- validating the core premise that proactive  |
| workload monitoring through data-driven systems like HeronPulse can   |
| intervene before burnout escalation occurs.                           |
|                                                                       |
| **3. Educational Data Mining and Predictive Analytics**               |
|                                                                       |
| Educational Data Mining (EDM) provides the methodological foundation  |
| for HeronPulse\'s machine learning pipeline. A 10-year EDM review by  |
| Kalita et al. (2025) confirms that regression-based academic          |
| prediction and proactive academic intervention remain the two         |
| dominant research trajectories in the field, and that ensemble        |
| methods --- particularly gradient boosting variants --- are the most  |
| consistently validated approaches for structured academic prediction  |
| tasks. Romero and Ventura (2023) establish in their updated EDM       |
| survey that student behavior patterns, course interaction logs, and   |
| academic scheduling records contain latent predictive signals that,   |
| when properly extracted through EDM techniques, enable reliable       |
| forecasting of student outcomes. HeronPulse applies this framework by |
| treating CCIS student academic records as structured data amenable to |
| Gradient Boosting Regression, enabling multi-horizon workload         |
| forecasting grounded in institutionally validated, real historical    |
| data.                                                                 |
+-----------------------------------------------------------------------+
| **Objective of the Study**                                            |
|                                                                       |
| The objective of this study is to design and develop HeronPulse, a    |
| web-based academic load forecasting and risk monitoring system that   |
| utilizes a hybrid theory-driven and data-validated Academic Load      |
| Index (ALI), combined with Gradient Boosting Regression for           |
| multi-horizon prediction of academic workload exposure among CCIS     |
| students of the University of Makati.                                 |
|                                                                       |
| **General Objective**                                                 |
|                                                                       |
| The general objective of the study is to develop a machine            |
| learning-based multi-horizon academic load forecasting and monitoring |
| system for CCIS students that computes a structured Academic Load     |
| Index using theory-grounded and expert-validated weighting, and       |
| predicts short-, mid-, and long-term workload exposure through        |
| Gradient Boosting Regression to support proactive academic planning   |
| and burnout risk prevention.                                          |
|                                                                       |
| **Specific Objectives**                                               |
|                                                                       |
| 1.  Examine and define measurable academic workload factors relevant  |
|     to CCIS students by reviewing related literature and conducting   |
|     structured consultations with CCIS faculty and students,          |
|     covering: (a) Task Density --- number of active academic tasks    |
|     within a rolling time window; (b) Assessment Intensity ---        |
|     frequency and weight of graded evaluations; (c) Deadline          |
|     Clustering --- number of overlapping deadlines within a defined   |
|     window; and (d) Research Load --- thesis, capstone, or research   |
|     project workload intensity.                                       |
|                                                                       |
| 2.  Construct a theory-driven Academic Load Index (ALI) using         |
|     expert-validated, Cognitive Load Theory-grounded weighting of the |
|     four selected academic workload factors, producing a normalized   |
|     0--100 composite score as the target variable for machine         |
|     learning prediction.                                              |
|                                                                       |
| 3.  Collect, preprocess, and normalize historical academic workload   |
|     data from CCIS student records (AY 2025--2026) for model          |
|     development, including data cleaning, feature engineering, and    |
|     outlier management.                                               |
|                                                                       |
| 4.  Train and evaluate a Gradient Boosting Regression (GBR) model for |
|     multi-horizon prediction (7-day, 14-day, and 30-day forecasts)    |
|     using the following evaluation metrics:                           |
|                                                                       |
|     a.  Mean Absolute Error (MAE)                                     |
|                                                                       |
|     b.  Root Mean Square Error (RMSE)                                 |
|                                                                       |
|     c.  R-squared (R²)                                                |
|                                                                       |
| 5.  Perform systematic algorithm benchmarking comparing GBR against   |
|     six competing regression algorithms --- Random Forest Regression, |
|     Linear Regression, Support Vector Regression (SVR), XGBoost,      |
|     LSTM, and Decision Tree Regression --- to empirically justify     |
|     GBR\'s selection as the primary predictive model.                 |
|                                                                       |
| 6.  Analyze GBR feature importance results to validate and refine the |
|     initial theory-based weighting of the ALI factors, producing a    |
|     comparative analysis of theory-based versus data-validated        |
|     weights.                                                          |
|                                                                       |
| 7.  Design and develop the HeronPulse web-based system with the       |
|     following key features:                                           |
|                                                                       |
| > a\. Academic Load Index (ALI) computation dashboard displaying      |
| > current and historical workload scores                              |
| >                                                                     |
| > b\. Multi-horizon workload forecasting visualization (7-day,        |
| > 14-day, 30-day)                                                     |
| >                                                                     |
| > c\. Risk level categorization and alert system (Low: 0--40,         |
| > Moderate: 41--70, High: 71--100)                                    |
| >                                                                     |
| > d\. Course-level workload breakdown and contribution analysis       |
| >                                                                     |
| > e\. Historical workload trend monitoring with comparative           |
| > term-over-term views                                                |
| >                                                                     |
| > f\. Responsive user interface accessible on desktop devices         |
| >                                                                     |
| > g\. Faculty/coordinator view for class-level workload monitoring    |
|                                                                       |
| 8.  Test the system\'s functional and non-functional requirements:    |
|                                                                       |
| > a\. Functional Testing --- forecast accuracy validation, ALI        |
| > computation verification, user input validation, role-based access  |
| > control                                                             |
| >                                                                     |
| > b\. Non-Functional Testing --- Performance efficiency (response     |
| > time), load testing, and stress testing                             |
|                                                                       |
| 9.  Evaluate the developed system using ISO 25010 quality standards   |
|     focusing on: (a) Functional Suitability; (b) Usability; and (c)   |
|     Performance Efficiency, through structured user acceptance        |
|     testing with CCIS students and faculty.                           |
|                                                                       |
| 10. Deploy HeronPulse as a proof-of-concept academic decision-support |
|     tool for CCIS and assess compliance with the Data Privacy Act of  |
|     2012 (RA 10173) in the handling of student academic records.      |
+-----------------------------------------------------------------------+
| **Scope and Limitations**                                             |
|                                                                       |
| **Scope**                                                             |
|                                                                       |
| This study focuses on the design, development, and evaluation of a    |
| web-based academic workload forecasting and risk monitoring system    |
| for CCIS students and faculty advisers of the University of Makati,   |
| Makati City, Metro Manila, Philippines. The system targets all        |
| undergraduate CCIS students and their corresponding faculty advisers  |
| as the primary user groups.                                           |
|                                                                       |
| **Utilization of the Algorithm**                                      |
|                                                                       |
| The primary focus of this research is the application of Gradient     |
| Boosting Regression (GBR) as the core machine learning algorithm for  |
| multi-horizon academic workload prediction. GBR was selected on the   |
| basis of its consistently superior performance on structured,         |
| continuous-target regression tasks in academic datasets --- as        |
| validated in comparative studies by Wang and Luo (2024, PLOS One) and |
| Multiple Authors (2025, Scientific Reports) --- and its native        |
| capacity to generate feature importance scores essential for ALI      |
| weight validation and refinement. The algorithm operates on the       |
| computed ALI composite score as the prediction target and produces    |
| forecasts at 7-day, 14-day, and 30-day horizons. The 7-day horizon    |
| aligns with the academic weekly planning cycle; the 14-day horizon    |
| covers the standard two-week assessment cycle in Philippine HEIs; and |
| the 30-day horizon enables strategic planning before major exam       |
| periods and capstone submission deadlines.                            |
|                                                                       |
| **Academic Load Factors**                                             |
|                                                                       |
| The Academic Load Index (ALI) is constructed from the following six   |
| measurable operational indicators:                                    |
|                                                                       |
| > • Task Density --- the number of active academic tasks              |
| > (assignments, activities, and projects) due within a rolling 7-day  |
| > window, weighted by estimated completion time per task              |
| >                                                                     |
| > • Assessment Intensity --- the frequency, weight, and proximity of  |
| > graded evaluations (quizzes, long exams, and major exams) within a  |
| > two-week period                                                     |
| >                                                                     |
| > • Deadline Clustering --- the number of overlapping submission      |
| > deadlines across all enrolled subjects within any 3-day window,     |
| > capturing peak academic congestion periods                          |
| >                                                                     |
| > • Research Load --- the active workload contribution of thesis,     |
| > capstone, or research project-related activities, quantified by     |
| > milestone proximity and draft submission requirements               |
| >                                                                     |
| > • Extracurricular Load --- the workload impact of student           |
| > organization activities, school events, and co-curricular           |
| > commitments that compete with academic study time                   |
| >                                                                     |
| > • Part-time Work Interference --- the degree to which part-time     |
| > employment obligations reduce available time for academic           |
| > preparation, encoded as hours per week of work commitment           |
|                                                                       |
| **Geographical Scope**                                                |
|                                                                       |
| The study is limited to students and faculty advisers of the College  |
| of Computing and Information Sciences (CCIS) at the University of     |
| Makati, Makati City, Metro Manila, Philippines. Data collection,      |
| system testing, and user acceptance evaluation will be conducted      |
| exclusively within this institution.                                  |
|                                                                       |
| **Temporal Scope**                                                    |
|                                                                       |
| Data collection, system development, and evaluation will be conducted |
| during Academic Year 2025--2026. All literature, related studies, and |
| supporting references cited in this research are limited to           |
| publications from 2023 up to the present to ensure currency and       |
| relevance of the evidence base.                                       |
|                                                                       |
| **Tools for System Design and Development**                           |
|                                                                       |
| The study employs the following tools and technologies in the design, |
| development, and deployment of HeronPulse:                            |
|                                                                       |
| > a\. Python 3.x --- primary programming language for the ML          |
| > pipeline, data preprocessing, and backend processing                |
| >                                                                     |
| > b\. Scikit-learn --- Gradient Boosting Regression implementation,   |
| > model training, hyperparameter tuning, cross-validation, and        |
| > feature importance analysis                                         |
| >                                                                     |
| > c\. Pandas and NumPy --- data manipulation, preprocessing,          |
| > normalization, and feature engineering                              |
| >                                                                     |
| > d\. Jupyter Notebook --- exploratory data analysis and iterative    |
| > model development                                                   |
| >                                                                     |
| > e\. FastAPI --- high-performance Python web framework for the       |
| > system backend and REST API                                         |
| >                                                                     |
| > f\. React.js --- component-based frontend user interface framework  |
| >                                                                     |
| > g\. Tailwind CSS --- utility-first CSS framework for responsive     |
| > frontend styling                                                    |
| >                                                                     |
| > h\. Recharts / Chart.js --- interactive data visualization for      |
| > workload dashboards and forecast charts within the React frontend   |
| >                                                                     |
| > i\. MySQL --- relational database management for student academic   |
| > workload records                                                    |
| >                                                                     |
| > j\. SQLAlchemy --- Python ORM for MySQL database interaction and    |
| > query management                                                    |
| >                                                                     |
| > k\. Alembic --- database schema migration manager for MySQL +       |
| > SQLAlchemy                                                          |
| >                                                                     |
| > l\. Vercel --- cloud deployment platform for the HeronPulse web     |
| > application                                                         |
|                                                                       |
| **Limitations**                                                       |
|                                                                       |
| Despite the study's objectives, the following limitations are         |
| acknowledged:                                                         |
|                                                                       |
| **Algorithm Dependency:** The predictive performance of HeronPulse is |
| contingent on the quality, completeness, and volume of available      |
| historical academic workload data from CCIS UMak. A minimum of 300    |
| complete student-semester records is estimated as necessary for       |
| stable and reliable GBR model training. Insufficient or               |
| inconsistently recorded data may reduce forecast accuracy across all  |
| three prediction horizons.                                            |
|                                                                       |
| **Data Simulation:** If historical academic workload data from CCIS   |
| UMak is insufficient for robust initial model training, simulated     |
| datasets constructed from documented CCIS course structures,          |
| assessment calendars, and faculty workload policies may be used.      |
| These synthetic datasets, while grounded in institutional reality,    |
| may not fully capture the natural variability of real-world academic  |
| workload patterns.                                                    |
|                                                                       |
| **Generalization:** The ALI framework, GBR model parameters, risk     |
| classification thresholds, and feature weights are calibrated         |
| specifically for CCIS students at UMak. Deployment to other colleges, |
| universities, or academic programs without system recalibration would |
| require re-validation of workload factor weights, ALI scoring ranges, |
| and risk level boundaries to reflect differing academic structures.   |
|                                                                       |
| **Psychological Factors:** HeronPulse strictly models operational     |
| academic workload exposure derived from quantifiable scheduled tasks, |
| assessments, deadlines, extracurricular commitments, and part-time    |
| work obligations. It does not directly measure or account for         |
| psychological stress, personal circumstances, health conditions,      |
| family obligations, or subjective cognitive burden. The ALI is a      |
| proxy for academic workload intensity and is not a clinical mental    |
| health assessment instrument.                                         |
|                                                                       |
| **Platform Limitations:** HeronPulse is designed and optimized for    |
| desktop and web browser environments. The system does not currently   |
| support native mobile applications. Variations in browser             |
| compatibility, screen resolution, and device performance may affect   |
| the user interface experience.                                        |
|                                                                       |
| **Data Privacy Compliance:** The collection, storage, processing, and |
| transmission of student academic records will be governed by the Data |
| Privacy Act of 2012 (Republic Act No. 10173) and the implementing     |
| rules of the National Privacy Commission. The study will secure       |
| institutional clearance from UMak's Data Privacy Officer, obtain      |
| written informed consent from all student and faculty participants    |
| prior to data collection, and implement full data anonymization       |
| protocols in the machine learning dataset to ensure no personally     |
| identifiable information is used in model training.                   |
|                                                                       |
| **Model Recalibration:** If HeronPulse is deployed to other colleges  |
| or institutions beyond CCIS UMak, the GBR model must be retrained on  |
| local academic data and the ALI factor weights must be recalibrated   |
| to accurately reflect the academic structure, course load             |
| distribution, and assessment patterns of the new institutional        |
| context.                                                              |
+-----------------------------------------------------------------------+
| **Conceptual Model of the Study**                                     |
|                                                                       |
| The conceptual model of HeronPulse provides a structured visual and   |
| narrative representation of the key components, variables, and        |
| relationships involved in the research. Grounded in Cognitive Load    |
| Theory, Educational Data Mining principles, and the academic burnout  |
| literature, the model illustrates how raw academic scheduling and     |
| activity data from CCIS students is transformed through a structured  |
| computational pipeline into actionable multi-horizon workload         |
| forecasts, risk classifications, and monitoring dashboards accessible |
| to both students and faculty advisers.                                |
|                                                                       |
| **IPO Diagram**                                                       |
|                                                                       |
| The Input-Process-Output (IPO) diagram illustrates the operational    |
| data flow of HeronPulse across its three primary components:          |
|                                                                       |
| **INPUTS**                                                            |
|                                                                       |
| -   Academic task data (assignments, activities, projects)            |
|                                                                       |
| -   Assessment schedules (quizzes, exams, major assessments)          |
|                                                                       |
| -   Project / research / thesis timelines                             |
|                                                                       |
| -   Deadline calendar (per subject)                                   |
|                                                                       |
| -   Historical workload records from previous terms                   |
|                                                                       |
| -   Course enrollment data (subjects, units, schedule)                |
|                                                                       |
| **PROCESS**                                                           |
|                                                                       |
| -   1\. Data Preprocessing & Normalization                            |
|                                                                       |
| -   2\. Six-Factor ALI Computation                                    |
|                                                                       |
| -   3\. GBR Model Training (Sciki t-learn)                            |
|                                                                       |
| -   4\. Multi-Horizon Forecasting (7/14/30-day)                       |
|                                                                       |
| -   5\. GBR Feature Importance Analysis                               |
|                                                                       |
| -   6\. Four-Level Risk Categorization                                |
|                                                                       |
| **OUTPUTS**                                                           |
|                                                                       |
| -   ALI Score (0--100 scale)                                          |
|                                                                       |
| -   7-day Workload Forecast                                           |
|                                                                       |
| -   14-day Workload Forecast                                          |
|                                                                       |
| -   30-day Workload Forecast                                          |
|                                                                       |
| -   Risk Level: Low / Moderate / High / Critical                      |
|                                                                       |
| -   Workload Trend Dashboard                                          |
|                                                                       |
| -   Feature Importance Report                                         |
|                                                                       |
| -   Risk Alert Notifications                                          |
+-----------------------------------------------------------------------+
| **Deliverables:**                                                     |
|                                                                       |
| The following are the deliverables of this study:                     |
|                                                                       |
| 1.  Structured Academic Load Index (ALI) Framework --- a fully        |
|     documented, six-factor workload quantification framework with     |
|     Cognitive Load Theory-grounded and expert-validated factor        |
|     weights, published as a reusable academic monitoring instrument   |
|     for CCIS UMak and comparable HEIs.                                |
|                                                                       |
| 2.  Trained and Evaluated GBR Prediction Model --- an optimized       |
|     Gradient Boosting Regression model producing 7-day, 14-day, and   |
|     30-day workload forecasts, with a full performance evaluation     |
|     report documenting RMSE, MAPE, and R² results across all forecast |
|     horizons.                                                         |
|                                                                       |
| 3.  Fully Functional Web-Based HeronPulse System --- a React.js +     |
|     FastAPI + MySQL web application with all eight system features:   |
|     ALI dashboard, multi-horizon forecast visualization, four-level   |
|     risk alert system, course-level breakdown, historical trend       |
|     monitoring, faculty adviser view, student self-input module, and  |
|     admin panel; deployed on Vercel.                                  |
|                                                                       |
| 4.  Algorithm Benchmarking Report --- a comparative analysis of GBR   |
|     against six competing ML algorithms (Random Forest Regression,    |
|     Linear Regression, SVR, XGBoost, LSTM, and Decision Tree          |
|     Regression) with documented accuracy metrics and empirical        |
|     justification for GBR's selection as the primary algorithm.       |
|                                                                       |
| 5.  ISO 25010 System Quality Evaluation Report --- a structured       |
|     evaluation report covering Functional Suitability, Usability, and |
|     Performance Efficiency based on user acceptance testing with CCIS |
|     students and faculty advisers.                                    |
|                                                                       |
| 6.  ALI Theory-Based vs. Data-Validated Weight Comparison Report ---  |
|     a documented analysis comparing the initial Cognitive Load        |
|     Theory-grounded expert weights against GBR feature                |
|     importance-derived weights, providing evidence-based              |
|     recommendations for ALI weight calibration.                       |
|                                                                       |
| 7.  Data Privacy Compliance Documentation --- complete                |
|     IRB/institutional clearance, informed consent forms for student   |
|     and faculty participants, and data anonymization protocols        |
|     demonstrating full compliance with the Data Privacy Act of 2012   |
|     (Republic Act No. 10173).                                         |
+-----------------------------------------------------------------------+
| **References**                                                        |
|                                                                       |
| Adefemi, K. O., & Mutanga, M. B. (2025). A robust hybrid CNN--LSTM    |
| model for predicting student academic performance. *Digital, 5*(2),   |
| 16. <https://doi.org/10.3390/digital5020016>                          |
|                                                                       |
| Ahmed, W., Wani, M. A., Plawiak, P., Meshoul, S., Mahmoud, A., &      |
| Hammad, M. (2025). Machine learning-based academic performance        |
| prediction with explainability for enhanced decision-making in        |
| educational institutions. *Scientific Reports, 15*, 26879.            |
| <https://doi.org/10.1038/s41598-025-12353-4>                          |
|                                                                       |
| Bernardo, A. B. I., Cordel, M. O., Calleja, M. O., Teves, J. M. M.,   |
| Yap, S. A., & Chua, U. C. (2023). Profiling low-proficiency science   |
| students in the Philippines using machine learning. *Humanities and   |
| Social Sciences Communications, 10*, 192.                             |
| <https://doi.org/10.1057/s41599-023-01705-y>                          |
|                                                                       |
| Cabanlit, I. S., Mission, J. L., Pabonita, L. C., Payusan, C. T.,     |
| Repollo, R. M., & Cabanilla, A. B. (2024). The correlation between    |
| homework load and academic burnout among college students.            |
| *International Journal of Multidisciplinary Research and Growth       |
| Evaluation, 5*(1).                                                    |
| [www.allmult                                                          |
| idisciplinaryjournal.com](http://www.allmultidisciplinaryjournal.com) |
|                                                                       |
| Geronimo, S. M., & Hernandez, A. A. (2023). Academic stress of        |
| students in higher education using machine learning: A systematic     |
| literature review. In *2023 IEEE 13th International Conference on     |
| System Engineering and Technology (ICSET)* (pp. 141--146). IEEE.      |
| <https://doi.org/10.1109/ICSET59111.2023.10295141>                    |
|                                                                       |
| Geronimo, S. M., Hernandez, A. A., Abisado, M. B., Rodriguez, R. L.,  |
| Nova, A. C., Caluya, S. S., & Blancaflor, E. B. (2023). Understanding |
| perceived academic stress among Filipino students during COVID-19     |
| using machine learning. In *Proceedings of SIGITE \'23* (pp. 1--9).   |
| ACM. <https://doi.org/10.1145/3585059.3611412>                        |
|                                                                       |
| Inyang, U. P., & Johnson, E. A. (2025). Performance comparison of     |
| XGBoost and random forest for the prediction of students\' academic   |
| performance. *European Journal of Computer Science and Information    |
| Technology, 13*(2), 1--21.                                            |
|                                                                       |
| Kalita, E., Oyelere, S. S., Gaftandzhieva, S., Rajesh, K. N.,         |
| Jagatheesaperumal, S. K., Mohamed, A., et al. (2025). Educational     |
| data mining: A 10-year review. *Discover Computing, 28*(1), 81.       |
| <https://doi.org/10.1007/s10791-025-09589-z>                          |
|                                                                       |
| Lim, J. C., Pacong, J. R. T., Alquizar, C. M. D., & Manaois, J. O.    |
| (2023). Unpacking post-pandemic academic burnout and coping           |
| mechanisms among Filipino college students. *International Journal of |
| Research and Innovation in Social Science, 7*(12), 1501--1511.        |
| <https://dx.doi.org/10.47772/IJRISS.2023.7012116>                     |
|                                                                       |
| Muhathir, M., Uska, M. Z., Lutfi, S., & Fathoni, A. (2025). Early     |
| prediction of university student dropout using temporal learning      |
| management system data and LSTM networks. *Journal of Smart System    |
| and Intelligent Learning, 1*(1), 19--26.                              |
| <https://doi.org/10.63980/jssil.v1i1.119>                             |
|                                                                       |
| Patosa, C. A. B., & Oclinaria, A. V. (2023). Academic stressors among |
| STEM students in transitional face-to-face classes. *International    |
| Journal of Multidisciplinary Educational Research and Innovation,     |
| 1*(4), 175.                                                           |
|                                                                       |
| Republic Act No. 10173. (2012). *Data Privacy Act of 2012*. Republic  |
| of the Philippines. <https://www.privacy.gov.ph/data-privacy-act/>    |
|                                                                       |
| Romero, C., & Ventura, S. (2023). Educational data mining and         |
| learning analytics: An updated survey. *Artificial Intelligence       |
| Review, 56*, 1--28. <https://doi.org/10.1007/s10462-022-10355-w>      |
|                                                                       |
| Suaza-Medina, M., Peñabaena-Niebles, R., & Jubiz-Diaz, M. (2024). A   |
| model for predicting academic performance on standardised tests for   |
| lagging regions based on machine learning and Shapley additive        |
| explanations. *Scientific Reports, 14*, 25306.                        |
| <https://doi.org/10.1038/s41598-024-76596-3>                          |
|                                                                       |
| Tapio, R. P. (2025). Predicting burnout in college students: A        |
| machine learning approach using decision tree and psychometric data.  |
| *Asian Journal of Probability and Statistics, 27*(5), 50--60.         |
| <https://doi.org/10.9734/ajpas/2025/v27i5754>                         |
|                                                                       |
| Švábenský, V., Verger, M., Rodrigo, M. M. T., Monterozo, C. J. G.,    |
| Baker, R. S., Saavedra, M. Z. N. L., Lallé, S., & Shimada, A. (2024). |
| Evaluating algorithmic bias in models for predicting academic         |
| performance of Filipino students. In *Proceedings of the 17th         |
| International Conference on Educational Data Mining (EDM 2024)*.      |
| <https://doi.org/10.5281/zenodo.12729936>                             |
|                                                                       |
| Wang, J., & Yu, Y. (2025). Machine learning approach to student       |
| performance prediction of online learning. *PLOS ONE, 20*(1),         |
| e0299018. <https://doi.org/10.1371/journal.pone.0299018>              |
|                                                                       |
| Wang, S., & Luo, B. (2024). Academic achievement prediction in higher |
| education through interpretable modeling. *PLOS One, 19*(9),          |
| e0309838. <https://doi.org/10.1371/journal.pone.0309838>              |
|                                                                       |
| Weng, S., Zheng, Y., Zhang, C., & Liu, Z. (2025). A gradient          |
| boosting-based feature selection framework for predicting student     |
| performance. *ICCK Transactions on Educational Data Mining, 1*(1),    |
| 25--35. <https://doi.org/10.62762/TEDM.2025.414136>                   |
|                                                                       |
| Geronimo, S. M., Cruz, J. D. L., & Hernandez, A. A. (2023).           |
| Development and evaluation of a machine learning-based academic       |
| stress detection system for Filipino college students. *Philippine    |
| Computing Journal, 17*(1). <https://doi.org/10.54497/pcj.17.1.2>      |
+-----------------------------------------------------------------------+
