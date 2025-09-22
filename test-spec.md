This program implements a simple pontoon game. Do the following things for me:

* Use Playwrite to play ONE test game.

* After each step, check the HTML DOM if it contains the expected game elements. Particularly check the presence of the cards and the points logic.

* After each step, create and store a screenshot. Use the _check image_ MCP server to verify if all expected game elements are present. Particularly check if the correct cards are visible and the points logic works as expected.

* If ANY of the expected DOM elements are missing or ANY visual verifications fail, stop the test IMMEDIATELY. Do NOT continue with the remaining test steps. Instead, look for a possible solution in the HTML, TS, and CSS code. Create a GitHub issue describing the problem AND your suggestion how to fix it. Do NOT fix the bug yet, just describe the solution in the GitHub issue.

* If all tests are ok, document every step of the test in a markdown file in the _test-documentation_ folder.

The app already runs on http://localhost:5173/

## Strict Pass/Fail Logic

Test passes ONLY if:

- ALL DOM elements exist AND
- ALL visual verifications pass AND  
- ALL game logic functions correctly

A single failure = overall test failure. No middle ground or "mostly working" assessments.

