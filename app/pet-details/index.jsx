import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native"
import PetInfo from "../../components/Pet-details/PetInfo";
import PetCharacteristics from "../../components/Pet-details/PetCharacteristics";
import PetAbout from "../../components/Pet-details/PetAbout";
import OwnerDetails from "../../components/Pet-details/OwnerDetails";
import Colors from "../../constants/Colors";
import {
   useUser

} from "@clerk/clerk-expo";
import { collection, doc, getDocs, query, setDoc } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { where } from "firebase/firestore";

const PetDetails = () => {
   const router = useRouter();
   const { user } = useUser()
   const pet = useLocalSearchParams();
   const navigation = useNavigation();
   useEffect(() => {
      navigation.setOptions({
         headerTransparent: true,
         headerTitle: ""
      })
   })
   //initiating chat between two users
   const handleAdoptMe = async () => {
      // router.push({
      //    pathname: 'chats'
      // })
      const doc1 = user?.primaryEmailAddress?.emailAddress + "_" + pet?.Email;
      console.log(pet?.Email);

      const doc2 = pet?.Email + "_" + user?.primaryEmailAddress?.emailAddress;
      try {
         const q = query(collection(db, 'Chats'), where('id', 'in', [doc1, doc2]))
         const querySnapshot = await getDocs(q)

         querySnapshot.forEach(doc => {
            console.log(doc.data());

            router.push({
               pathname: 'chats',
               params: { id: doc.id }
            })
         })
         if (querySnapshot.docs.length == 0) {
            try {
               await setDoc(doc(db, 'Chats', doc1), {
                  id: doc1,
                  users: [
                     {
                        email: user?.primaryEmailAddress?.emailAddress,
                        imageUrl: user?.imageUrl,
                        name: user?.fullName
                     },
                     {
                        email: pet?.Email,
                        imageUrl: pet?.UserImage,
                        name: pet?.Username
                     }
                  ],
                  userIds: [user?.primaryEmailAddress?.emailAddress, pet?.Email]
               })
               router.push({
                  pathname: 'chats',
                  params: { id: doc.id }
               })
            }
            catch (error) {
               console.log(error);

            }

         }

      }
      catch (error) {
         console.log(error);

      }

   }
   return <View>
      <ScrollView>
         {/* Pet info */}
         <PetInfo pet={pet}></PetInfo>

         {/* Pet characteristics */}
         <PetCharacteristics pet={pet}></PetCharacteristics>

         {/* about */}
         <PetAbout pet={pet}></PetAbout>

         {/* owner details */}
         <OwnerDetails pet={pet}></OwnerDetails>
      </ScrollView>
      {/* adopt me button */}

      <TouchableOpacity onPress={handleAdoptMe} style={styles.button}>
         <Text style={styles.text}>Adopt Me</Text>
      </TouchableOpacity>
   </View>
}
export default PetDetails;
const styles = StyleSheet.create({
   button: {
      backgroundColor: Colors.PRIMARY,
      padding: 15,
      position: 'absolute',
      bottom: 0,
      width: '100%'
   },
   text: {
      textAlign: 'center',
      fontFamily: 'outfit-medium',
      fontSize: 18
   }
})