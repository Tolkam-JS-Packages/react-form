import { Fragment, isValidElement, ReactNode } from 'react';
import Updater from './Updater';
import Listener from './Listener';

/**
 * @param children
 */
const validateNestedChildren = (children: ReactNode) => {
    if(!isValidElement(children)) {
        return;
    }

    // children must not be the Updater or Listener itself as
    // they need to be wrapped to enable unmounting for
    // dynamically added components
    const type = children.type;
    const forbidden: any = [Updater, Listener, Fragment];
    if(forbidden.indexOf(type) !== -1 && process.env.NODE_ENV !== 'production') {
        throw new Error(
            'Listener or Updater children must not be wrapped with each other or React.Fragment. '
            + 'Please, wrap each with some element'
        );
    }
}

export { validateNestedChildren };
