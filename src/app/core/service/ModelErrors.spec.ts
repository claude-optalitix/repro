import { InvalidModelError, UnexpectedModelError } from './ModelErrors'


describe('ModelErrors', () => {

    function checkProps(error: Error, expected: any) {
        expect(error).not.toBeNull();
        for (const key in expected) {
            if (Object.prototype.hasOwnProperty.call(expected, key)) {
                const expectedValue = expected[key];
                const value = error[key];

                expect(value).toEqual(expectedValue);
            }
        }
    }

    it('test errors', () => {
        checkProps(new InvalidModelError('toto', { a: 1 }), { message: 'toto', properties: { a: 1 } });
        checkProps(new UnexpectedModelError('toto'), { message: 'toto'});
    });
});