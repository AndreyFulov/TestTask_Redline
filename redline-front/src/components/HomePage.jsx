import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [address, setAddress] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem('user_id'); // Получаем ID пользователя из localStorage

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Загружаем адреса для текущего пользователя
      axios
        .get(`http://localhost:8000/api/users/${userId}/addresses`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setSavedAddresses(response.data);
        })
        .catch((err) => {
          console.error('Ошибка при загрузке адресов.');
        });
    }
  }, [userId]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/search', {
        params: { address },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSearchResults(response.data.suggestions || []);
      setError(null);
    } catch (err) {
      setError('Не удалось выполнить поиск. Попробуйте снова.');
    }
  };

  const handleSaveAddress = (address) => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .post(
          `http://localhost:8000/api/users/${userId}/addresses`,
          { address },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          setSavedAddresses((prev) => [...prev, response.data]);
          setAddress(''); // Очистка поля
          setSearchResults([]); // Очистка результатов поиска
          setError(null);
        })
        .catch((err) => {
          setError('Не удалось сохранить адрес. Попробуйте снова.');
        });
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');

      if (token) {
        await axios.post(
          'http://localhost:8000/api/logout',
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        localStorage.removeItem('token'); // Удаление токена
        localStorage.removeItem('user_id'); // Удаление ID пользователя
        navigate('/login'); // Перенаправление на страницу входа
      }
    } catch (err) {
      console.error('Ошибка при выходе.');
    }
  };


  const handleDeleteAddress = (addressId) => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .delete(`http://localhost:8000/api/users/${userId}/addresses/${addressId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => {
          setSavedAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
          setError(null);
        })
        .catch((err) => {
          setError('Не удалось удалить адрес. Попробуйте снова.');
        });
    }
  };
  return (
    <div>
      <h1>Добро пожаловать на главную страницу!</h1>

      <form onSubmit={handleSearch}>
        <div>
          <label htmlFor="address">Введите адрес для поиска:</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Введите адрес"
            required
          />
        </div>
        <button type="submit">Поиск</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {searchResults.length > 0 && (
        <div>
          <h2>Результаты поиска:</h2>
          <ul>
            {searchResults.map((result, index) => (
              <li key={index}>
                {result.value}
                <button onClick={() => handleSaveAddress(result.value)}>Сохранить</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2>Сохраненные адреса:</h2>
      <ul>
        {savedAddresses.map((addr) => (
           <li key={addr.id}>
           {addr.address}
           <button onClick={() => handleDeleteAddress(addr.id)}>Удалить</button>
         </li>
        ))}
      </ul>

      <button onClick={handleLogout}>Выйти</button>
    </div>
  );
}

export default HomePage;
