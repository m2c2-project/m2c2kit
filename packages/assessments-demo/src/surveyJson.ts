export const surveyJson = {
  title: "m2c2kit demo survey",
  /**
   * Specify a name for the survey so m2c2kit can assign an identifier for
   * this activity. Within a study, use different survey names.
   */
  name: "demo-survey",
  confirmSkipping: true,
  pages: [
    {
      name: "page1",
      elements: [
        {
          type: "expression",
          /**
           * Preface the name with double underscore if you don't want to
           * generate data from the element.
           */
          name: "__welcome",
          title: "This is an example welcome screen.",
        },
      ],
    },
    {
      name: "page2",
      elements: [
        {
          type: "radiogroup",
          name: "where_now",
          title: "Where are you?",
          choices: [
            {
              value: 1,
              text: "Your home",
            },
            {
              value: 2,
              text: "Other person's home",
            },
            {
              value: 3,
              text: "Office or other work place",
            },
            {
              value: 4,
              text: "Other",
            },
          ],
        },
      ],
      description: "RIGHT NOW...",
    },
    {
      name: "page3",
      elements: [
        {
          /**
           * checkbox is a multi-select question type. m2c2kit will store
           * the answer as a series of variables, one for each choice. These
           * are typically called "dummy variables." The value of the dummy
           * variable will be 1 if the choice was selected, and 0 otherwise.
           * The name of each dummy variable will be the name of the element
           * followed by an underscore and the name of the choice, e.g.,
           * "who_now_spousepartner." If a choice name is not configured, the
           * value will be used instead, e.g., "who_now_1". If a "none"
           * choice is configured (hasNone: true), the name of this none
           * choice should be set using the "noneName" property (the "name"
           * property is used for the checkbox element name).
           */
          type: "checkbox",
          name: "who_now",
          title: "Who is around you? (Please select all that apply.)",
          choices: [
            {
              value: 1,
              text: "Spouse/Partner",
              name: "spousepartner",
            },
            {
              value: 2,
              text: "Your child(ren) or grandchild(ren)",
              name: "children",
            },
            {
              value: 3,
              text: "Other family member(s)",
              name: "otherfamily",
            },
            {
              value: 4,
              text: "Other people",
              name: "otherpeople",
            },
          ],
          hasNone: true,
          noneText: "Nobody",
          noneName: "nobody",
        },
      ],
      description: "RIGHT NOW...",
    },
    {
      name: "page4",
      elements: [
        {
          type: "nouislider-m2c2",
          name: "mood_valence",
          title: "How is your overall MOOD?",
          rangeMin: 0,
          rangeMax: 100,
          pipsDensity: -1,
          showOnlyPipsWithPipsText: true,
          pipsText: [
            {
              value: 0,
              text: "Very Bad",
            },
            {
              value: 100,
              text: "Very Good",
            },
          ],
        },
      ],
      description: "example of a custom SurveyJS widget.",
    },
    {
      name: "page5",
      elements: [
        {
          name: "date",
          type: "bootstrapdatepicker",
          inputType: "date",
          title: "What is your favorite date?",
          dateFormat: "mm/dd/yy",
        },
      ],
      description: "example of a custom SurveyJS widget.",
    },
    {
      name: "page6",
      elements: [
        {
          name: "countries",
          type: "tagbox",
          title:
            "Please select all countries you have been for the last 3 years.",
          choices: [
            {
              value: 1,
              text: "USA",
            },
            {
              value: 2,
              text: "Mexico",
            },
            {
              value: 3,
              text: "Canada",
            },
            {
              value: 999,
              text: "None",
            },
          ],
        },
      ],
      description: "example of a custom SurveyJS widget.",
    },
    {
      name: "page7",
      elements: [
        {
          name: "bootstrapslider-widget",
          type: "bootstrapslider-m2c2",
          title: "This is a different style of slider.",
          step: 50,
          rangeMin: 100,
          rangeMax: 1000,
        },
      ],
      description: "example of a custom SurveyJS widget.",
    },
  ],
  /**
   * Uncomment to suppress questions numbers
   */
  // showQuestionNumbers: "off",

  /**
   * On the last question, the advance button will say "Complete". You can
   * specify a different text.
   */
  // completeText: "Finish"
};
