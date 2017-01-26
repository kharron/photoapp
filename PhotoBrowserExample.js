import React, { Component } from 'react';
import {
  ActionSheetIOS,
  CameraRoll,
  ListView,
  StyleSheet,
  Navigator,
  Text,
  TouchableOpacity,
  View,
  Platform
} from 'react-native';
import Button from 'react-native-button';
import PhotoBrowser from 'react-native-photo-browser';
import db, { firebaseAuth, firebaseTimeStamp} from './db/database';


const EXAMPLES = [
  {
    title: 'All your photos',
    description: 'Photos from Gallery',
    startOnGrid: true,
    displayNavArrows: true,
    displaySelectionButtons: true,
  },
  {
    title: 'Your saved photos',
    description: 'Photos saved in Firebase',
    startOnGrid: true,
    displayNavArrows: true,
  },
  {
    title: 'Photos not saved',
    description:'Photos not saved yet',
    startOnGrid: true,
    displayNavArrows:true,
  }
];

CameraRoll.getPhotos({
  first: 100,
  assetType: 'Photos',
}).then((data) => {
  const media = [];
  data.edges.forEach(d => media.push({
    photo: d.node.image.uri,
  }));


  EXAMPLES[0].media = media;

}).catch(error => alert(error));

db.singleRef.child('list').on('value', function(datasnapshot){
  const media = [];
  datasnapshot.forEach(function(childsnapshot){
      var item = {
        photo: childsnapshot.val().path,
        selected: true,
      }

      media.push(item);
  });

 

    EXAMPLES[0].media =  EXAMPLES[0].media.concat(media);

        function dedupeByKey(arr, key) {
          const tmp = {};
          return arr.reduce((p, c) => {
            const k = c[key];
            if (tmp[k]) return p;
            tmp[k] = 1;
            return p.concat(c);
          }, []);
        }


    
     var part2 = EXAMPLES[0].media;
     var part1 = media;

     var test = part1.concat(part2);

     EXAMPLES[0].media = dedupeByKey(test, 'photo');
     var galleryLength = EXAMPLES[0].media.length;
     var mediaLength = media.length;

     var finalLength = galleryLength - mediaLength;
     console.log("Length", finalLength);

     EXAMPLES[2].media = EXAMPLES[0].media.slice(0, finalLength);
});






db.singleRef.child('list').on('value', function(datasnapshot){
  const media = [];
  datasnapshot.forEach(function(childsnapshot){
      var item = {
        photo: childsnapshot.val().path,
      }

      media.push(item);
  });

  console.log(media);
    EXAMPLES[1].media = media;
    console.log(EXAMPLES[1].media);
});



export default class PhotoBrowserExample extends Component {

  constructor(props) {
    super(props);

    this._onSelectionChanged = this._onSelectionChanged.bind(this);
    this._onActionButton = this._onActionButton.bind(this);
    this._renderRow = this._renderRow.bind(this);
    this._renderScene = this._renderScene.bind(this);

    const dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
    });

    this.state = {
      dataSource: dataSource.cloneWithRows(EXAMPLES),
    };
  }

   _handlePress() {
    const photos = EXAMPLES[0].media;
    for (var i=0; i<photos.length; i++){
      console.log('Aqui', photos[i].photo);
      var newChildRef = db.imgRef.child('list').push();
      newChildRef.set({
        savedAt: firebaseTimeStamp,
        path: photos[i].photo
      }, function(){
        console.log('Backed up!');
      })
    }
   
  }

  _onSelectionChanged(media, index, selected) {
    //alert(`${media.photo} selection status: ${selected}`);

    if (selected == true) {
           db.singleRef.child('list').orderByChild('path').equalTo(media.photo).once('value', function(snapshot){
          if (snapshot.val() === 'undefined' || snapshot.val() === null) {
                    var single = db.singleRef.child('list').push();
                            single.set({
                              savedAt: firebaseTimeStamp,
                              path: media.photo
                            }, function(){
                              console.log('Added to firebase');
                            });

                            alert('saved in Firebase!');
          }
          else{
            alert('This file is already saved in Firebase!');
          }
    })
    }else{
                 
                 db.singleRef.child('list').orderByChild('path').equalTo(media.photo).once('value', function(snapshot){
                            if (snapshot.val() === 'undefined' || snapshot.val() === null) {
                                console.log('Not in Firebase');
                              }else{
                                snapshot.forEach(function(data){
                                  var key = data.key;
                                  console.log(data.key);
                                  db.singleRef.child('list').child(key).remove();
                                alert('Removed from Firebase')
                                })
                                
                              }
                  })

    }

   
  
  }

  _onActionButton(media, index) {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showShareActionSheetWithOptions({
        url: media.photo,
        message: media.caption,
      },
      () => {},
      () => {});
    } else {
      alert(`handle sharing on android for ${media.photo}, index: ${index}`);
    }
  }

  _openExample(example) {
    this.refs.nav.push(example);
  }

  _renderRow(rowData, sectionID, rowID) {
    const example = EXAMPLES[rowID];

    return (
      <TouchableOpacity onPress={() => this._openExample(example) }>
        <View style={styles.row}>
          <Text style={styles.rowTitle}>{rowData.title}</Text>
          <Text style={styles.rowDescription}>{rowData.description}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  _renderScene(route, navigator) {
    if (route.index === 0) {
      return (
        <View style={styles.container}>
          <ListView
            style={styles.list}
            dataSource={this.state.dataSource}
            renderRow={this._renderRow}
          />

            <Button
              style={{fontSize: 20, color: 'green'}}
              styleDisabled={{color: 'red'}}
              onPress={() => this._handlePress()}>
              Back up all your photos!
      </Button>
        </View>
      );
    }


    

    const {
      media,
      initialIndex,
      displayNavArrows,
      displayActionButton,
      displaySelectionButtons,
      startOnGrid,
      enableGrid,
    } = route;

    return (

      <PhotoBrowser
        onBack={navigator.pop}
        mediaList={media}
        initialIndex={initialIndex}
        displayNavArrows={displayNavArrows}
        displaySelectionButtons={displaySelectionButtons}
        displayActionButton={displayActionButton}
        startOnGrid={startOnGrid}
        enableGrid={enableGrid}
        useCircleProgress
        onSelectionChanged={this._onSelectionChanged}
        onActionButton={this._onActionButton}
      />
        
      
    );
  }

  render() {
    return (
      <Navigator
        ref="nav"
        initialRoute={{ index: 0 }}
        renderScene={this._renderScene}
      />
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
    paddingTop: 54,
    paddingLeft: 16,
  },
  row: {
    flex: 1,
    padding: 8,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    borderBottomWidth: 1,
  },
  rowTitle: {
    fontSize: 14,
  },
  rowDescription: {
    fontSize: 12,
  },
});
