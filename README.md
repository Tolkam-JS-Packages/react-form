# tolkam/react-form

Controllable forms base with async state validation.

## Usage

````tsx
import { render } from 'react-dom';
import { Form, Input, Textarea, Select, IValidator } from '@tolkam/react-form';

// mock validator
class MyValidator implements IValidator {
    public validate(name: string, value: unknown): Promise<TSourceErrors|null> {
        const min = 200;
        const max = 800;
        const delay = Math.random() * (max - min) + min;

        console.log('validating...');
        return new Promise((resolve) => {
            setTimeout(() => {
                if(name === 'myText' && value !== 'default text') {
                    resolve(['some error']);
                } else {
                    resolve(null);
                }
                console.log('validated');
            }, delay);
        });
    }
}

const form = <Form
        name="myForm"
        validator={new MyValidator}
        onSend={(name, state) => {console.log(name, state)}}
    >
    <Form.Listener of="myText">{state =>
        <div>
            <Form.Updater of="myText" key="myText" default="default text">{({listen, update}) =>
                <Input {...{listen, update}} maxLength={20} updateOn="blur" />
            }</Form.Updater>
            <pre>{JSON.stringify(state)}</pre>
        </div>
    }</Form.Listener>

    <Form.Listener of="myCheckbox">{state =>
        <div>
            <Form.Updater of="myCheckbox" key="myCheckbox" default="maybe">{({listen, update}) =>
                <label>
                    <Input {...{listen, update}} type="checkbox" value="yes" /> check
                </label>
            }</Form.Updater>
            <pre>{JSON.stringify(state)}</pre>
        </div>
    }</Form.Listener>

    <Form.Listener of="myRadio">{state =>
        <div>
            <Form.Updater of="myRadio" key="myRadio" default="B">{({listen, update}) =>
                <>
                    <label>
                        <Input {...{listen, update}} type="radio" value="A" /> A
                    </label>
                    <label>
                        <Input {...{listen, update}} type="radio" value="B" /> B
                    </label>
                </>
            }</Form.Updater>
            <pre>{JSON.stringify(state)}</pre>
        </div>
    }</Form.Listener>

    <Form.Listener of="myTextarea">{state =>
        <div>
            <Form.Updater
                of="myTextarea"
                key="myTextarea"
                default="default text"
                debounce={500}
            >{({listen, update}) =>
                <Textarea {...{listen, update}} maxLength={20} />
            }</Form.Updater>
            <pre>{JSON.stringify(state)}</pre>
        </div>
    }</Form.Listener>

    <Form.Listener of="mySelect">{state =>
        <div>
            <Form.Updater of="mySelect" key="mySelect">{({listen, update}) =>
                <Select {...{listen, update}}>
                    <option value="">--</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                </Select>
            }</Form.Updater>
            <pre>{JSON.stringify(state)}</pre>
        </div>
    }</Form.Listener>

    <Form.Listener>{state =>
        <div>
            <b>Form state:</b>
            <pre>{JSON.stringify(state, null, 2)}</pre>
            <p>
                <button type="reset" disabled={!state.touched}>reset</button>
                <button type="submit" disabled={state.busy}>submit</button>
            </p>
        </div>
    }</Form.Listener>
</Form>

render(form, document.getElementById('app'));
````

## Documentation

The code is rather self-explanatory and API is intended to be as simple as possible. Please, read the sources/Docblock if you have any questions. See [Usage](#usage) for quick start.

## License

Proprietary / Unlicensed 🤷
