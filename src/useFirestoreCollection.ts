import * as firebase from 'firebase/app';
import { React } from './util';

type useFirestoreCollectionHook<T> = [
    T[],
    (newDoc: T) => Promise<firebase.firestore.DocumentReference>,
];

export function useFirestoreCollection<T>(
    { useEffect, useState }: React,
    app: firebase.app.App,
    path: string
): useFirestoreCollectionHook<T> {
    const [data, setData] = useState([] as any);
    const user = app.auth().currentUser;
    path = path.charAt(0) === '$' ? path.replace('$', `/users/${user && user.uid}`) : path;
    const collectionRef = app.firestore().collection(path);

    // Subscribe to real-time updates
    useEffect(
        function subscribe() {
            function onSnapUpdate(snap: firebase.firestore.QuerySnapshot) {
                const contents = snap.docs;
                setData(contents);
            }
            const unsubscribe = collectionRef.onSnapshot(onSnapUpdate);
            return unsubscribe;
        },
        [user, path]
    );

    function addDocument(newDoc: T) {
        return collectionRef.add(newDoc);
    }

    return [data, addDocument];
}
