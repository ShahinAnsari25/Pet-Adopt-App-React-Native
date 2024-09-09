import { collection, getDocs, where } from "firebase/firestore";
import { View, Text, FlatList } from "react-native"
import { db } from "../../config/firebaseConfig";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { query } from "firebase/firestore";
import { useNavigation } from "expo-router";
import UserItem from "../../components/inbox/userItems";

const Inbox = () => {
   const { user } = useUser();
   const navigate = useNavigation()
   const [userList, setUserList] = useState([])
   const [loader, setLoader] = useState(false)
   useEffect(() => {
      user && getUserList()
      // navigate.setOptions({
      //    // headerTitle: "",
      //    // headerTransparent: true
      // })
   }, [user])
   //get userlist depend upon current username
   const getUserList = async () => {
      setLoader(true)
      setUserList([])
      try {
         const q = query(collection(db, 'Chats'),
            where('userIds', 'array-contains', user?.primaryEmailAddress?.emailAddress))
         const querySnapshot = await getDocs(q);
         querySnapshot.forEach(doc => (
            setUserList(prev => [...prev, doc.data()])
            // console.log(doc.data())
         ))
      }
      catch (error) {
         console.log(error);

      }
      setLoader(false)
   }
   //filter the list of other user in one state
   const mapOtherUserList = () => {
      const list = []
      userList.forEach((record) => {
         const otherUser = record.users?.filter(item => item?.email != user?.primaryEmailAddress?.emailAddress)
         const result = {
            docId: record.id,
            ...otherUser[0]
         }
         list.push(result)

      })
      return list;
   }

   return <View style={{ paddingLeft: 10, paddingRight: 10, paddingBottom: 20 }}>
      <FlatList
         onRefresh={getUserList}
         refreshing={loader}
         data={mapOtherUserList()}
         renderItem={({ item, index }) => (
            <UserItem key={index} userInfo={item}></UserItem>
         )}
      >

      </FlatList>
   </View>
}
export default Inbox;