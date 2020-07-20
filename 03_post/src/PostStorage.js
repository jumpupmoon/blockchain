import {contract} from './Ehtereum';

function timestampToDate(UNIX_timestamp) {
    let a = new Date(UNIX_timestamp * 1000);
    let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let year = a.getFullYear();
    let month = months[a.getMonth()];
    let date = a.getDate();
    let hour = a.getHours();
    let min = a.getMinutes();
    let sec = a.getSeconds();
    let time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
  }

class PostStorage {
    posts = [];
    subscribers = new Set();

    subscribe(component) {
        this.subscribers.add(component);
        this.publish();
    }
    
    unsubscribe(component) {
        this.subscribers.delete(component);
    }

    publish() {
        for(let component of this.subscribers) {
            component.setState({posts: this.posts});
        }
    }

    constructor() {
        (async () => {
            const numPosts = await contract.methods.getNumberPosts().call();
            for(let i= numPosts-1; i>=0 && i>=numPosts-11; --i) {
                await this.getPost(i);
            }
            this.publish();
        })();
    }

    newPost() {

    }

    insertPost(post) {
        let pos = this.posts.findIndex(p => {
            return p.id < post.id;
        })

        this.posts.splice(pos, 0, post);
    }

    async getPost(id) {
        const post = await contract.methods.post(id).call();
        this.insertPost({
            ...post,
            id: id,
            date: timestampToDate(post.updated),
        })
    }
}

const postStorage = new PostStorage();

export default postStorage;