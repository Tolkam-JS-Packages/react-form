import { PureComponent, ReactNode } from 'react';
import { TSourceProps, events } from '@tolkam/lib-form';
import FormContext, { IFormContext } from './FormContext';
import * as React from 'react';

class Listener extends PureComponent<IProps, IListeningChildState> {

    /**
     * @type {Host}
     */
    public static contextType = FormContext;

    /**
     * @type {Host}
     */
    declare public context: IFormContext;

    /**
     * @type {IListeningChildState}
     */
    public state = {
        touched: false,
        busy: false,
        value: null,
        errors: null,
    };

    /**
     * @type {Function}
     */
    private unsubscribe: Function;

    /**
     * @inheritDoc
     */
    public componentDidMount(): void {
        const { props } = this;

        this.unsubscribe = this.context.host.listen(
            events.ANY,
            (state: IListeningChildState) => this.setState(state),
            props.of
        );

        // force update to re-render children with default data
        this.forceUpdate();
    }

    /**
     * @inheritDoc
     */
    public componentWillUnmount(): void {
        const { unsubscribe } = this;
        unsubscribe && unsubscribe();
    }

    /**
     * @inheritDoc
     */
    public render(): ReactNode {
        return this.props.children(this.state);
    }
}

interface IListeningChildState extends TSourceProps {}

interface IListeningChild {
    (state: IListeningChildState): ReactNode;
}

interface IProps {
    children: IListeningChild;
    of?: string;
}

export default Listener;

export {
    IProps,
    IListeningChild,
    IListeningChildState,
}
