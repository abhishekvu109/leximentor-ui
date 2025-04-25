import {useEffect, useState} from "react";

const ListChallenges = ({}) => {
    // const router = useRouter();
    // const wordRefId = router.query.challengeId;
    // // 4113968317282955619
    // return (<>
    //     <Word_render value={wordRefId}></Word_render>
    // </>);
    const [count, setCount] = useState(0);

    useEffect(() => {
        // This runs after every render
        console.log('Effect ran');

        // You can perform side effects here

        // Cleanup function (runs before the next effect and on unmount)
        return () => {
            console.log('Cleanup');
        };
    }, [count]); // Dependency array, effect will re-run if count changes

    const increment = () => {
        setCount(count + 1);
    };

    return (<div>
        <h1>Count: {count}</h1>
        <button onClick={increment}>Increment</button>
    </div>);

};

export default ListChallenges;
