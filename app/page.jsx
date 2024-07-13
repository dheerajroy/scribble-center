"use client";

import { throttle } from 'lodash';
import { useLayoutEffect, useState } from 'react';
import { DefaultSpinner, Tldraw, createTLStore, getSnapshot, loadSnapshot } from 'tldraw';
import 'tldraw/tldraw.css';

const PERSISTENCE_KEY = 'example-3';

export default function PersistenceExample() {
    const [store] = useState(() => createTLStore());
    const [loadingState, setLoadingState] = useState({
        status: 'loading'
    });

    useLayoutEffect(() => {
        setLoadingState({ status: 'loading' });

        const persistedSnapshot = localStorage.getItem(PERSISTENCE_KEY);

        if (persistedSnapshot) {
            try {
                const snapshot = JSON.parse(persistedSnapshot);
                loadSnapshot(store, snapshot);
                setLoadingState({ status: 'ready' });
            } catch (error) {
                setLoadingState({ status: 'error', error: error.message });
            }
        } else {
            setLoadingState({ status: 'ready' });
        }

        const cleanupFn = store.listen(
            throttle(() => {
                const snapshot = getSnapshot(store);
                localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(snapshot));
            }, 500)
        );

        return () => {
            cleanupFn();
        };
    }, [store]);

    if (loadingState.status === 'loading') {
        return (
            <div className="tldraw__editor">
                <h2>
                    <DefaultSpinner />
                </h2>
            </div>
        );
    }

    if (loadingState.status === 'error') {
        return (
            <div className="tldraw__editor">
                <h2>Error!</h2>
                <p>{loadingState.error}</p>
            </div>
        );
    }

    return (
        <div className="fixed top-0 left-0 w-full h-screen">
            <Tldraw store={store} theme="dark" />
        </div>
    );
}
