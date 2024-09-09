import { useLocalSearchParams, useNavigation } from "expo-router";
import { getDoc, doc, addDoc, collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../config/firebaseConfig";
import { useUser } from "@clerk/clerk-expo";
import { GiftedChat } from "react-native-gifted-chat";
import moment from "moment";

const Chats = () => {
   const navigation = useNavigation()
   const { user } = useUser()
   const params = useLocalSearchParams();
   const [messages, setMessages] = useState([])
   useEffect(() => {
      getUserDetails()
      //new
      // Fetching chats and ordering by createdAt
      const messageQuery = query(
         collection(db, 'Chats', params?.id, 'Messages'),
         orderBy('createdAt', 'desc')  // Order messages by createdAt in descending order
      );
      //new
      //fetching chats
      const unsubscribe = onSnapshot(messageQuery, (snapshot) => {
         const messageData = snapshot.docs.map((doc) => ({
            _id: doc.id,
            ...doc.data()
         }))
         setMessages(messageData)
      })
      return () => unsubscribe
   }, [])
   const getUserDetails = async () => {
      try {
         const docRef = doc(db, 'Chats', params?.id);
         const docSnap = await getDoc(docRef)
         const result = docSnap.data();
         // console.log(result);
         const otherUser = result?.users.filter(item => item.email != user.primaryEmailAddress.emailAddress)
         console.log(otherUser);
         navigation.setOptions({
            headerTitle: otherUser[0].name
         })

      }
      catch (error) {
         console.log(error);
      }

   }
   const onSend = async (NewMessage) => {
      setMessages(previousMessages =>
         GiftedChat.append(previousMessages, NewMessage),
      )
      NewMessage[0].createdAt = moment().valueOf()
      console.log(NewMessage[0].createdAt);

      try {
         await addDoc(collection(db, 'Chats', params.id, 'Messages'), NewMessage
         [0])
      }
      catch (error) {
         console.log(error);

      }
   }
   return <GiftedChat
      messages={messages}
      onSend={messages => onSend(messages)}
      showUserAvatar={true}
      user={{
         _id: user?.primaryEmailAddress?.emailAddress,
         name: user?.fullName,
         avatar: user?.imageUrl
      }}
   />
}
export default Chats;