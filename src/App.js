import { useState } from 'react';
import './App.css';

function App() {
  const [userData, setUserData] = useState({ username: '', password: '' });
  const [userList, setUserList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');

  // 취약한 코드 - 사용자 입력을 그대로 HTML에 주입 (XSS 취약점)
  const renderMessage = () => {
    return { __html: message };
  };

  // 취약한 코드 - 입력 유효성 검사 없음
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 취약점: 비밀번호를 평문으로 저장
    setUserList([...userList, userData]);
    setUserData({ username: '', password: '' });
    
    // 취약점: 사용자 입력을 검증 없이 표시
    setMessage(`Welcome, ${userData.username}!`);
  };

  // 취약한 코드 - 클라이언트 사이드에서 하드코딩된 API 키
  const API_KEY = 'sk_test_abcdefghijklmnopqrstuvwxyz123456';
  
  // 취약한 코드 - SQL 인젝션 위험이 있는 쿼리 구성 (실제로는 실행되지 않지만 예시용)
  const searchUsers = () => {
    // 가상의 SQL 쿼리 - 실제로는 실행되지 않음
    const query = `SELECT * FROM users WHERE username LIKE '%${searchQuery}%'`;
    console.log("Executing query:", query);
    
    // 검색 결과 필터링
    const results = userList.filter(user => 
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return results;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>사용자 등록 데모</h1>
        
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="username">사용자 이름:</label>
            <input
              id="username"
              type="text" 
              value={userData.username}
              onChange={(e) => setUserData({...userData, username: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">비밀번호:</label>
            <input
              id="password"
              type="password"
              value={userData.password}
              onChange={(e) => setUserData({...userData, password: e.target.value})}
            />
          </div>
          
          <button type="submit">등록</button>
        </form>
        
        {/* 취약점: dangerouslySetInnerHTML 사용 (XSS 취약점) */}
        <div dangerouslySetInnerHTML={renderMessage()} />
        
        <div className="search-section">
          <h2>사용자 검색</h2>
          <input
            type="text"
            placeholder="검색어 입력..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={searchUsers}>검색</button>
        </div>
        
        <div className="user-list">
          <h2>등록된 사용자 목록</h2>
          <ul>
            {userList.map((user, index) => (
              <li key={index}>
                사용자명: {user.username}, 비밀번호: {user.password}
              </li>
            ))}
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;