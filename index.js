// NOTE
// https://w3c-test.org/submissions/4768/payment-request/payment-request-show-accept-promise-returned.html

class PaymentAddress {
  constructor(
    country,
    addressLine,
    region=null,
    city=null,
    dependentLocality=null,
    postalCode=null,
    sortingCode=null,
    languageCode=null,
    organization=null,
    recipient=null,
    phone=null
  ) {
    this.country = country;
    this.addressLine = addressLine;
    this.region = region;
    this.city = city;
    this.dependentLocality = dependentLocality;
    this.postalCode = postalCode;
    this.sortingCode = sortingCode;
    this.languageCode = languageCode;
    this.organization = organization;
    this.recipient = recipient;
    this.phone = phone;
  }

  static get country() {
    return this.country;
  }
  static set country(value) {
    throw new DOMException('The country property is read-only');
  }

  static get addressLine() {
    return this.addressLine;
  }
  static set addressLine(value) {
    throw new DOMException('The addressLine property is read-only');
  }

  static get region() {
    return this.region;
  }
  static set region(value) {
    throw new DOMException('The region property is read-only');
  }

  static get city() {
    return this.city;
  }
  static set city(value) {
    throw new DOMException('The city property is read-only');
  }

  static get dependentLocality() {
    return this.dependentLocality;
  }
  static set dependentLocality(value) {
    throw new DOMException('The dependentLocality property is read-only');
  }

  static get postalCode() {
    return this.postalCode;
  }
  static set postalCode(value) {
    throw new DOMException('The postalCode property is read-only');
  }

  static get sortingCode() {
    return this.sortingCode;
  }
  static set sortingCode(value) {
    throw new DOMException('The sortingCode property is read-only');
  }

  static get languageCode() {
    return this.languageCode;
  }
  static set languageCode(value) {
    throw new DOMException('The languageCode property is read-only');
  }

  static get organization() {
    return this.organization;
  }
  static set organization(value) {
    throw new DOMException('The organization property is read-only');
  }

  static get recipient() {
    return this.recipient;
  }
  static set recipient(value) {
    throw new DOMException('The recipient property is read-only');
  }

  static get phone() {
    return this.phone;
  }
  static set phone(value) {
    throw new DOMException('The phone property is read-only');
  }
}

const PaymentShippingType = {
  SHIPPING: Symbol('shipping'),
  DELIVERY: Symbol('delivery'),
  PICKUP: Symbol('pickup'),
};

const PaymentRequestState = {
  CREATED: Symbol('created'),
  INTERACTIVE: Symbol('interactive'),
  CLOSED: Symbol('closed'),
};

class PaymentRequest {

  constructor(
    methodData,
    details,
    options
  ) {
    // 1. If a paymentRequestId was not provided during construction, generate
    //    a paymentRequestId.
    let id = 'dummy_payment_request_id';
    if (details && details.id) {
      id = details.id;
    }

    // 2. If the current settings object's responsible document is not allowed
    //    to use the feature indicated by attribute name allowpaymentrequest,
    //    then throw a "SecurityError" DOMException.

    // 3. Let serializedMethodData be an empty list.
    let serializedMethodData = [];

    // 4. Process payment methods:

    //    4.1 If the length of the methodData sequence is zero, then throw a
    //        TypeError, optionally informing the developer that at least one
    //        payment method is required.
    if (!Array.isArray(methodData) || methodData.length == 0) {
      throw new TypeError('methodData is a required parameter');
    }

    //    4.2 For each paymentMethod of methodData:
    methodData.forEach((paymentMethod) => {

      //    4.2.1 If the length of the paymentMethod.supportedMethods sequence
      //          is zero, then throw a TypeError, optionally informing the
      //          developer that each payment method needs to include at least
      //          one payment method identifier.
      if (!Array.isArray(paymentMethod.supportedMethods) ||
        paymentMethod.supportedMethods.length == 0) {
        throw new TypeError('each payment method needs to include at least '+
          'one payment method identifier');
      }

      //    4.2.2 Let serializedData be the result of JSON-serializing
      //          paymentMethod.data into a string, if the data member of
      //          paymentMethod is present, or null if it is not. Rethrow any
      //          exceptions.
      let serializedData = null;
      if (paymentMethod.data) {
        serializedData = JSON.stringify(paymentMethod.data)
      }

      //    4.2.3 Add the tuple (paymentMethod.supportedMethods,
      //          serializedData) to serializedMethodData.
      serializedMethodData.push({
        supportedMethods: paymentMethod.supportedMethods,
        serializedData: serializedData,
      })
    });

    // 5. Process the total:

    //   5.1 If the total member of details is not present, then throw a
    //       TypeError, optionally informing the developer that including
    //       total is required.
    if (!details) {
      throw new TypeError('details is a required parameter');
    }
    if (!details.total) {
      throw new TypeError('details must have a total');
    }

    //   5.2 If details.total.amount.value is not a valid decimal monetary
    //       value, then throw a TypeError; optionally informing the
    //       developer that the value is invalid.
    if (!details.total.amount) {
      throw new TypeError('details.total must have an amount');
    }
    if (!details.total.amount.value ||
      !details.total.amount.value.match(/^-?[0-9]+(\.[0-9]+)?$/)) {
      throw new TypeError('details.total.value must be a valid decimal '+
        'monetary value');
    }

    //   5.3 If the first character of details.total.amount.value is U+002D
    //       HYPHEN-MINUS, then throw a TypeError, optionally informing the
    //       developer that the total can't be negative.
    if (details.total.amount[0] === '-') {
      throw new TypeError('details.total.value cannot be negative');
    }

    // TODO(stan): what about the currency? at least a regexp?

    // 6. If the displayItems member of details is present, then for each
    //    item in details.displayItems:
    if (Array.isArray(details.displayItems)) {
      details.displayItems.forEach((displayItem) => {

        // 6.1 If item.amount.value is not a valid decimal monetary value,
        //     then throw a TypeError, optionally informing the developer
        //     that the value is invalid.
        if (!displayItem.amount) {
          throw new TypeError('displayItem must have an amount');
        }
        if (!displayItem.amount.value ||
          !displayItem.amount.match(/^-?[0-9]+(\.[0-9]+)?$/)) {
          throw new TypeError('displayItem.amount.value is not a valid '+
            'decimal monetary value');
        }

        // TODO(stan): what about the currency? at least a regexp?
      })
    }

    // 7. Let selectedShippingOption be null.
    let selectedShippingOption = null;

    // 8. Process shipping options:

    //   8.1 Let options be an empty sequence<PaymentShippingOption>.
    let shippingOptions = []

    // TODO(stan): rename options -> shippingOptions

    //   8.2 If the shippingOptions member of details is present, then:
    if (Array.isArray(details.shippingOptions)) {

      //   8.2.1 Let seenIDs be an empty list.
      let seenIDs = [];

      //   8.2.2 Set options to details.shippingOptions.
      shippingOptions = details.shippingOptions

      //   8.2.3 For each option in options:
      shippingOptions.some((option) => {

        //   8.2.3.1 If option.amount.value is not a valid decimal monetary
        //           value, then throw a TypeError, optionally informing the
        //           developer that the value is invalid.
        if (!option.amount) {
          throw new TypeError('shippingOption must have an amount');
        }
        if (!option.amount.value ||
          !option.amount.value.match(/^-?[0-9]+(\.[0-9]+)?$/)) {
          throw new TypeError('shippingOption.amount.value is not a valid '+
            'decimal monetary value');
        }

        //   8.2.3.2 If seenIDs contains option.id, then set options to an
        //           empty sequence and break.
        if (seenIDs.includes(option.id)) {
          shippingOptions = [];
          return true;
        }

        //   8.2.3.3 Append option.id to seenIDs.
        shippingOptions.push(option);
        return false;
      });

      //   8.2.4 For each option in options (which may have been reset to the
      //         empty sequence in the previous step):
      shippingOptions.forEach((option) => {

        //   8.2.4.1 If option.selected is true, then set
        //           selectedShippingOption to option.id.
        if (option.selected) {
          selectedShippingOption = option.id;
        }
      })
    }

    //   8.3 Set details.shippingOptions to options.
    details.shippingOptions = shippingOptions;

    // 9. Let serializedModifierData be an empty list.
    let serializedModifierData = [];

    // 10. Process payment details modifiers:

    // TODO(stan)

    // 11. If the error member of details is present, then throw a TypeError,
    //     optionally informing the developer that an error message cannot be
    //     specified in the constructor.
    if (details.error) {
      throw new TypeError('details.error cannot be set at construction');
    }

    // 12. Let request be a new PaymentRequest.
    // NOOP

    // 13. Set request.[[options]] to options.
    this.options = options;

    // 14. Set request.[[state]] to "created".
    this.state = PaymentRequestState.CREATED;

    // 15. Set request.[[state]] to "created".
    this.updating = false;

    // 16. Set request.[[details]] to details.
    this.details = details;

    // 17. Set request.[[serializedModifierData]] to serializedModifierData.
    this.serializedModifierData = serializedModifierData;

    // 18. Set request.[[serializedMethodData]] to serializedMethodData.
    this.serializedMethodData = serializedMethodData;

    // 19. Set the value of request's shippingOption attribute to
    //     selectedShippingOption.
    this.shippingOption = selectedShippingOption

    // 20. Set the value of the shippingAddress attribute on request to null.
    this.shippingAddress = null;

    // 21. Set the value of the shippingType attribute on request to null.
    this.shippingType = null;

    // 22. If options.requestShipping is set to true, then set the value of the
    //     shippingType attribute on request to options.shippingType. If
    //     options.shippingType is not a valid PaymentShippingType value then
    //     set the value of the shippingType attribute on request to
    //     "shipping".
    if (options && options.requestShipping) {
      switch (options.shippingType) {
        case 'shipping':
          this.shippingType = PaymentShippingType.SHIPPING;
          break;
        case 'delivery':
          this.shippingType = PaymentShippingType.DELIVERY;
          break;
        case 'pickup':
          this.shippingType = PaymentShippingType.PICKUP;
          break;
        default:
          this.shippingType = PaymentShippingType.SHIPPING;
          break;
      }
    }

    // Other internal state.
    this.id = id;
    this.acceptPromise = null;

    // TODO(stan) add setting id in the constructor reference?
  }

  static get id() {
    return 'foo';
  }
  static set id(value) {
    throw new DOMException('The id property is read-only');
  }

  static get shippingAddress() {
    return this.shippingAddress;
  }
  static set shippingAddress(value) {
    throw new DOMException('The shippingAddress property is read-only');
  }

  static get shippingOption() {
    return this.shippingOption;
  }
  static set shippingOption(value) {
    throw new DOMException('The shippingOption property is read-only');
  }

  static get shippingType() {
    return this.shippingType;
  }
  static set shippingType(value) {
    throw new DOMException('The shippingType property is read-only');
  }

  show() {
    this.acceptPromise = new Promise((resolve, reject) => {
      this.showResolve = resolve;
      this.showReject = reject;
    });
    // TODO show something
    return this.acceptPromise;
  }
}
