import * as firebase from 'firebase/app';
import { React } from './util';

type useFirestoreCollectionHook<T> = [
    T[],
    (newDoc: T) => Promise<firebase.firestore.DocumentReference>,
];

export function useFirestoreCollection<T>(
    { useEffect, useState }: React,
    app: firebase.app.App,
    path: string,
    orderBy: string | [string] | undefined,
    limit: number | undefined,
): useFirestoreCollectionHook<T> {
    const [data, setData] = useState([] as any);
    const user = app.auth().currentUser;
    path = path.charAt(0) === '$' ? path.replace('$', `/users/${user && user.uid}`) : path;
    let collectionRef = app.firestore().collection(path);
    let query: firebase.firestore.Query<firebase.firestore.DocumentData> = collectionRef;
    if (orderBy instanceof Array) {
        orderBy.forEach((order) => {
            query = query.orderBy(order);
        });
    } else if (orderBy !== undefined)  {
        query = query.orderBy(orderBy);
    }
    if (limit !== undefined) {
        query = collectionRef.limit(limit);
    }

    // Subscribe to real-time updates
    useEffect(
        function subscribe() {
            function onSnapUpdate(snap: firebase.firestore.QuerySnapshot) {
                const contents = snap.docs;
                setData(contents);
            }
            const unsubscribe = query.onSnapshot(onSnapUpdate);
            return unsubscribe;
        },
        [user, path, orderBy, limit]
    );

    function addDocument(newDoc: T) {
        return collectionRef.add(newDoc);
    }

    return [data, addDocument];
}
