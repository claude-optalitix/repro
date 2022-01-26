class InvalidModelError extends Error {
    public properties: any;

    constructor(message: string, properties: any) {
        super(message);
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, InvalidModelError.prototype);

        this.properties = properties;
    }
}

class UnexpectedModelError extends Error {
      
    constructor(message: string) {
        super(message);
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, InvalidModelError.prototype);
    }
}

export { InvalidModelError, UnexpectedModelError };