import '../assets/styles/footer.css'

export default {
    data() {
        return {
            author: 'Phoebe'
        }
    },
    render() {
        return (
            <div id="footer">
                <span>Writtem By {this.author}</span>
            </div>
        )
    }
}