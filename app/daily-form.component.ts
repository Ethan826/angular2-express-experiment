/// <reference path="../typings/main/ambient/jquery/index.d.ts"/>
/// <reference path="../node_modules/angular2/typings/es6-promise/es6-promise.d.ts"/>
/// <reference path="../typings/main/ambient/jqueryui/index.d.ts"/>

import {Component, Injector, OnInit} from "angular2/core";
import {
ControlGroup,
FormBuilder,
Control,
AbstractControl,
Validators
} from "angular2/common";
import {IButtonQuestion, ICheckboxQuestion} from "./interfaces";
import {buttonQuestions, checkboxQuestions} from "./question-data";
import {AccountService} from "./account.service";
import {CanActivate, ComponentInstruction} from "angular2/router";
import {HTTP_PROVIDERS, Http} from "angular2/http";
import {checkAuth} from "./login.service";
import {FormsService} from "./forms.service";
import {Router, RouteConfig, ROUTER_DIRECTIVES} from "angular2/router";

/**
 * Principal interactive component in the app. Imports questions from
 * `question-data`, a quasi json set of data representing the questions asked
 * by the app. The imported data is programatically converted into a deeply
 * nested set of `ControlGroup`s. The imported data is also programatically
 * converted into the template, which attaches the html to the relevant
 * `Control`s.
 */
@CanActivate((to: ComponentInstruction, fr: ComponentInstruction) => {
  return checkAuth(["standard", "admin"]);
})
@Component({
  selector: "daily-form",
  providers: [HTTP_PROVIDERS, FormsService],
  directives: [ROUTER_DIRECTIVES],
  template: `
  <!-- Header material -->
  <h1>Daily Tracker</h1>
  <br>

  <form [ngFormModel]="dailyGroup">

    <!-- Date -->
    <legend>Date</legend>

    <input type="text"
           [ngFormControl]="dailyGroup.controls['date']"
           readonly="readonly"
           id="date-picker">
    <br><br>

    <!-- Button Questions -->

    <div *ngFor="#outer of getKeys(buttonQuestions)">
      <legend>{{buttonQuestions[outer].legend}}</legend>
      <label>{{buttonQuestions[outer].explanatoryText}}</label>
      <br>
      <div class="btn-group" data-toggle="buttons">
        <label *ngFor="#inner of getKeys(buttonQuestions[outer].buttons)"
               class="btn btn-default"
               [class.error]="submitAttempted | async"
               (click)="handleButtonSelection(outer, inner)">
          <input type="radio"
                 name="{{outer}}">
            {{buttonQuestions[outer].buttons[inner]}}
        </label>
      </div>
      <br>
      <br>
      <div class="form-group">
        <!-- This is getting a little hairy. Consider refactoring. -->
        <input [ngFormControl]="dailyGroup.controls.buttonGroup.controls[outer].controls['textField']"
               placeholder="{{buttonQuestions[outer].placeholderText}}"
               class="form-control"
               type="text">
      </div>
      <br>
    </div>

    <!-- Checkbox Questions -->

    <div *ngFor="#outer of getKeys(checkboxQuestions)">
      <label>
        <input type="checkbox"
               (click)="handleCheckboxSelection(outer)">
          &emsp; {{checkboxQuestions[outer]["checkboxPrompt"]}}
      </label>
      <div *ngIf="checkShowText(outer)">
        <div class="form-group">
          <input [ngFormControl]="dailyGroup.controls.checkboxGroup.controls[outer].controls['textPrompt']"
                 placeholder="{{checkboxQuestions[outer].textPrompt}}"
                 class="form-control"
                 type="text">
      </div>
      </div>
    </div>
    <br>

    <!-- Form Submit -->

    <button type="submit"
            class="btn btn-primary"
            (click)=submitForm()
            [class.disabled]="!dailyGroup.valid">Submit</button>
  </form>
  `
})
export class DailyForm implements OnInit {
  private buttonQuestions: { [key: string]: IButtonQuestion };
  private checkboxQuestions: { [key: string]: ICheckboxQuestion };
  private testBool: boolean;
  private buttonGroup: ControlGroup;
  private checkboxGroup: ControlGroup;
  private dailyGroup: ControlGroup;

  constructor(
    private fb: FormBuilder,
    private formsService: FormsService,
    private router: Router
    ) {
    this.buildForm();
  }

  private buildForm() {
    this.buttonQuestions = buttonQuestions;
    this.checkboxQuestions = checkboxQuestions;
    let dateString = new Date().toLocaleDateString();
    this.dailyGroup = this.fb.group({

      // Date is a string in sqlite, so nothing lost here
      "date": [dateString, Validators.required],

      "buttonGroup": this.buttonGroupBuilder(this.buttonQuestions),
      "checkboxGroup": this.checkboxGroupBuilder(this.checkboxQuestions)
    });
  }

  /**********************************************
   * Event handlers and submits                 *
   *********************************************/

  /*
   * Although Angular 2 allows attaching a `Control` to a set of radio
   * buttons, it does not seem automatically to handle the `true` and
   * `false` states of the other buttons, nor to mark `dirty` or `touched`.
   */

  /**
   * @internal
   */
  private handleButtonSelection(outer: string, inner: string) {
    // Hack to suppress type error (temp is a Control)
    let temp: any = this.dailyGroup.controls["buttonGroup"];
    let controls: any = temp.controls[outer].controls["buttons"].controls;

    for (let c in controls) {
      if (controls.hasOwnProperty(c)) {
        controls[c].updateValue(false);
      }
    }
    controls[inner].updateValue(true);
    controls[inner].markAsTouched();
    controls[inner].markAsDirty();
  }

  /**
   * @internal
   */
  private handleCheckboxSelection(outer: string) {
    // Hack to suppress type error (temp is a Control)
    let temp: any = this.dailyGroup.controls["checkboxGroup"];
    let control = temp.controls[outer].controls["checkboxPrompt"];

    control.updateValue(!control.value);
    control.markAsTouched();
    control.markAsDirty();
  }

  /**
   * @internal
   */
  private submitForm() {
    if (!this.dailyGroup.valid) {
      alert("You must click on at least one button in each set.");
    } else {
      let form = this.processForm();
      this.formsService.submitDaily(form)
        .then((result) => {
        if (result && result["error"]) { alert(result["error"]); }
        else {
          alert("Success!");
          location.reload();
        }
      })
        .catch(e => console.error(e));
    }
  }

  /**
   * @internal
   */
  private processForm(): Object {
    // Shorten the names (plus hack to avoid type error)
    let temp: any = this.dailyGroup.controls["buttonGroup"];
    let bc = temp.controls;
    temp = this.dailyGroup.controls["checkboxGroup"];
    let cc = temp.controls;

    let result = {};

    // User ID will be added / checked in `formsService`

    result["date"] = new Date(
      Date.parse(this.dailyGroup.controls["date"].value)
      )
      .toISOString()
      .slice(0, 10);

    // TODO: define an interface to ensure type correctness here and on the
    // server-side code.
    result["hungerscore"] = this.getPoints(bc["hungerControl"]);
    result["hungertext"] = bc["hungerControl"].value["textField"];
    result["cravingscore"] = this.getPoints(bc["cravingControl"]);
    result["cravingtext"] = bc["cravingControl"].value["textField"];
    result["satietyscore"] = this.getPoints(bc["satiety"]);
    result["satietytext"] = bc["satiety"].value["textField"];
    result["energyscore"] = this.getPoints(bc["energyLevel"]);
    result["energytext"] = bc["energyLevel"].value["textField"];
    result["wellbeingscore"] = this.getPoints(bc["wellBeing"]);
    result["wellbeingtext"] = bc["wellBeing"].value["textField"];
    result["carbsscore"] = this.getPoints(bc["processedCarbs"]);
    result["carbstext"] = bc["processedCarbs"].value["textField"];

    result["stressambool"] = cc["amStress"].value["checkboxPrompt"] ? 1 : 0;
    result["stresspmbool"] = cc["pmStress"].value["checkboxPrompt"] ? 1 : 0;
    result["walksbool"] = cc["walks"].value["checkboxPrompt"] ? 1 : 0;
    result["movementbool"] = cc["movement"].value["checkboxPrompt"] ? 1 : 0;
    result["movementtext"] = cc["movement"].value["textPrompt"];
    result["bedtimebool"] = cc["bedtime"].value["checkboxPrompt"] ? 1 : 0;
    result["bedtimetext"] = cc["bedtime"].value["textPrompt"];

    return result;
  }

  /**********************************************
   * Set up form                                *
   *********************************************/

  /**
   * Attach the JQueryUI calendar widget to the form.
   */
  ngOnInit() {
    let control: any = this.dailyGroup.controls["date"];
    $("#date-picker").datepicker({
      onSelect: (date: string) => { control.updateValue(date); }
    });
  }

  /**
   * @internal  uses the imported `buttonQuestions` to build the `ControlGroup`
   *            that is used in the template.
   */
  private buttonGroupBuilder(
    buttonQuestions: { [key: string]: IButtonQuestion }
    ): ControlGroup {
    // Accumulator of outer ControlGroup
    let finalResult = {};

    // Loop over questions by key to build up outer ControlGroup
    let questionKeys = this.getKeys(buttonQuestions);
    questionKeys.forEach(questionKey => {
      let intermediateResult = {};
      let buttonQuestion = buttonQuestions[questionKey];
      let buttonKeys = this.getKeys(buttonQuestion.buttons);

      // Loop over buttons to build inner ControlGroups
      let tertiaryResult = {};
      buttonKeys.forEach(buttonKey => {
        tertiaryResult[buttonKey] = [false];
      });

      // Add the text field
      intermediateResult["buttons"] = this.fb.group(
        tertiaryResult,
        { validator: this.oneControlIsChecked }
        );
      intermediateResult["textField"] = [""];
      finalResult[questionKey] = this.fb.group(intermediateResult);
    });
    return this.fb.group(finalResult);
  }

  /**
   * @internal  uses the imported `buttonQuestions` to build the `ControlGroup`
   *            that is used in the template.
   */
  private checkboxGroupBuilder(
    checkboxQuestions: { [key: string]: ICheckboxQuestion }
    ) {
    let finalResult = {};
    this.getKeys(checkboxQuestions).forEach((outer) => {
      let intermediateResult = {};
      this.getKeys(checkboxQuestions[outer]).forEach((inner) => {
        // TODO: Refactor to avoid matching the string
        if (inner === "textPrompt") {
          intermediateResult[inner] = [""];
        } else {
          intermediateResult[inner] = [false];
        }
      });
      finalResult[outer] = this.fb.group(intermediateResult);
    });
    return this.fb.group(finalResult);
  }

  /**********************************************
   * Validators and helpers                     *
   *********************************************/

  /**
   * @internal  Validator
   */
  private oneControlIsChecked(group: ControlGroup) {
    let counter = 0;
    for (let key in group.controls) {
      if (group.controls.hasOwnProperty(key)) {
        counter += group.controls[key].value ? 1 : 0;
      }
    }
    if (counter === 1) {
      return null;
    } else {
      return { "mustSelectExactlyOneButton": true };
    };
  }

  // This is a userful helper method and could be put in a service.
  /**
   * @internal
   */
  private getKeys(objects: { [val: string]: any }) {
    return Object
      .keys(objects)
      .filter(object => { return objects.hasOwnProperty(object); });
  }

  /**
   * @internal  Helper method used by the *ngIf to display text fields.
   */
  private checkShowText(outer: string) {
    let temp: any = this.dailyGroup.controls["checkboxGroup"];
    let control = temp.controls[outer].controls["checkboxPrompt"];
    return Boolean(
      control.value && temp.controls[outer].controls["textPrompt"]
      );
  }

  /**
   * @internal  Helper method used in `submitForm`
   */
  private getPoints(buttonGroup: ControlGroup | any): number {
    let keys = this.getKeys(buttonGroup.value["buttons"]);
    let result: number = null;
    keys.forEach(key => {
      if (buttonGroup.value["buttons"][key]) {
        result = Number(key);
      }
    });
    return result;
  }
}
