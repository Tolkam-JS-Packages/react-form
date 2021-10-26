import { TSourceProps, ISourceActions, events } from '@tolkam/lib-form';
import { PureComponent, ReactNode } from 'react';
import FormContext, { IFormContext } from './FormContext';
import * as React from 'react';

class Updater extends PureComponent<IProps, unknown> {

    /**
     * @type {<Partial<IProps>>}
     */
    public static defaultProps = {
        default: null,
    };

    /**
     * @type {Host}
     */
    public static contextType = FormContext;

    /**
     * @type {Host}
     */
    declare public context: IFormContext;

    /**
     * @type {ISourceActions}
     */
    private sourceActions: ISourceActions;

    /**
     *
     * @type {number}
     */
    protected updateId: number;

    /**
     * @inheritDoc
     */
    public componentDidMount() {
        const that = this;
        const {props, context} = that;
        const {form, host} = context;

        // default from props has greater priority
        let def = props.default;
        if(def == null) {
            def = form.getDefaultValue(props.of);
        }

        // add a value source
        that.sourceActions = host.addSource(props.of, def, props.debounce);

        // force update to re-render and
        // provide received source actions to children
        // AND init source with default value, if Updater was added dynamically
        that.forceUpdate(() => def != null && that.sourceActions.init(def));
    }

    /**
     * @inheritDoc
     */
    public componentWillUnmount(): void {
        this.context.host.removeSource(this.props.of);
    }

    /**
     * @inheritDoc
     */
    public render(): ReactNode {
        const that = this;
        const sourceActions = that.sourceActions;

        return sourceActions ? this.props.children({
            listen: that.subscribe,
            update: sourceActions.update,
            setBusy: sourceActions.setBusy,
            setErrors: sourceActions.setErrors,
        }) : null;
    }

    /**
     * Registers updates listener
     *
     * @param listener
     */
    private subscribe = (listener: (value: unknown) => void): () => void =>
        this.sourceActions.listen(events.ANY, (props: TSourceProps) =>
            listener(props.value));
}

interface IUpdatingChildActions {
    // listen
    listen: (listener: TListener) => TListenerRemover;

    // update
    update: (value: unknown) => void;

    // set busy
    setBusy: (busy: boolean) => void;

    // set errors
    setErrors: (errors: string[]) => void;
}

interface IUpdatingChild {
    (actions: IUpdatingChildActions): ReactNode;
}

interface IProps {
    // require unique key (usually same as props.of)
    // to be able to use conditional Updaters
    key: string;

    // field name to register
    of: string;

    // children renderer
    children: IUpdatingChild;

    // default field value
    default?: unknown;

    // update delay
    debounce?: number|boolean;
}

type TListener = (value: unknown) => void;

type TListenerRemover = () => void;

export default Updater;
export {
    IProps,
    IUpdatingChild,
    IUpdatingChildActions
}
